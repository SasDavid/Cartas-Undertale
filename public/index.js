const socket = io();
const enviarMensaje = document.querySelector(".enviarMensaje");
const chatMensaje = document.querySelector(".chat-messages");
const mensaje = document.getElementById("mensaje");
const game = document.getElementById("container-game");
const containerMensaje = document.getElementById("container-mensaje");


socket.on("EnviarCodigo", info =>{
	console.log(info.mensaje);

	if(startB == true){
		socket.emit("resetGame");
		socket.emit("start");
	}
})

const audio = document.querySelector("audio");

socket.on("activeAudio", ()=>{
	audio.play();
})


//Controles ----------------------------------------

socket.on("offControl1", info =>{
	info == "on" ? control1.style.opacity = 0.5 : control1.style.opacity = 1;
});

socket.on("offControl2", info =>{
	info == "on" ? control2.style.opacity = 0.5 : control2.style.opacity = 1;
});

socket.on("sincronizacion", info=> {
	socket.emit("sincronizacion");
})

const control1 = document.querySelector(".control1");
const control2 = document.querySelector(".control2");

function controlador(num){
	socket.emit(`controles`, num);
}

control1.addEventListener("click", ()=>{
	controlador(1);
})

control2.addEventListener("click", ()=>{
	controlador(2);
})


let cartas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let obten;
const buttonStart = document.getElementById("start");
startN = 0;
startB = true;


socket.on("resetGame", ()=>{
	cartas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	startN = 0;
	startB = false;
})


buttonStart.addEventListener("click", ()=>{
	if(startB == true){
		socket.emit("resetGame");
		socket.emit("start");
	}
})

const puntuacionBlue = document.getElementById("puntuacionBlue");
const puntuacionRed = document.getElementById("puntuacionRed");
const textTurn = document.getElementById("textTurn");
let mensajeGlobal;

socket.on("textTurn", info =>{
	inicial = false;
	mensajeGlobal = info;
	dialogoProgre2();
});

socket.on("puntuacion", info =>{
	puntuacionBlue.textContent = info.blue;
	puntuacionRed.textContent = info.red;
});

let dialogo = ""; 
let newDialogo = ""; 
let numDialogo = 0;
let newElement = null;
let inicial = false;

function dialogoProgre2(){

	if(!inicial){
		textTurn.textContent = "";
		inicial = false;
		dialogo = mensajeGlobal;
		newDialogo = "";
		numDialogo = 0;
		inicial = true;
		dialogoProgre2();
		return;
	}

	newDialogo += dialogo[numDialogo];
	textTurn.textContent += dialogo[numDialogo];
	numDialogo++;

	if(newDialogo == dialogo){
		inicial = false;
		return;
	}

	setTimeout(()=>{
		dialogoProgre2();
	}, 5)

}

function dialogoProge(mensaje){
	textTurn.textContent = "";
	inicial = false;
	dialogo = mensaje;
	newDialogo = "";
	numDialogo = 0;
	dialogoProgre2();
}

const todasCartas = document.querySelectorAll(".cart");
let cartasAwake = 0;

socket.on("reset", function(){
	todasCartas.forEach(function(res){
		res.removeAttribute("style");
		res.src = "/img/default.png";
		res.style.opacity = 0;
		setTimeout(()=>{
			res.style.opacity = 1;
		}, 1000)
	})
})

todasCartas.forEach(function(res){
	res.numCart = cartasAwake;
	res.addEventListener("click", ()=>{
		socket.emit("seeCart", res.numCart);
	})
	cartasAwake++;
});

socket.on("leeCart", info=>{
	let a = document.querySelector(".cart" + info.numCart);
	a.src = `img/${info.typeCart}.png`;
	a.style.outline = `2px solid ${info.color}`;
})

socket.on("girarCart", info=>{
	let a = document.querySelector(".cart" + info);
	a.removeAttribute("style");
	a.src = `/img/default.png`;
})

socket.on("activarCart", info =>{
	a = document.querySelector(`.cart${info.numCart}`);
	a.src = `img/${info.typeCart}.png`;
	a.style.outline = `2px solid ${info.color}`;
});


// socket.on("cartasRepartidas", info =>{
// 	let asignarCarta = document.querySelector(`.cart${info.startN}`);
// 	asignarCarta.numCart = startN;
// 	asignarCarta.addEventListener("click", ()=>{
// 		console.log(asignarCarta.numCart);
// 		asignarCarta.classList.add("select");
// 		asignarImg(num + 1, asignarCarta);
// 	});
// })

// function getNum(){
// 	let num = Math.round(Math.random()*23);

// 	if(cartas[num] < 2){

// 		startN++;
// 		let asignarCarta = document.querySelector(`.cart${startN}`);

// 		cartas[num] += 1;
// 		asignarCarta.numCart = startN;

// 		asignarCarta.addEventListener("click", ()=>{
// 			console.log(asignarCarta.numCart);
// 			asignarCarta.classList.add("select");
// 			asignarImg(num + 1, asignarCarta);
// 		});

// 		asignarImg(num + 1, asignarCarta);

// 		if(startN == 48){
// 			startB = true;
// 			console.log("startON");

// 		}
// 	}
// }



const cargando = document.getElementById("cargando");
const containerCargando = document.querySelector(".container-cargando");

function offSectionCarga(){

	setTimeout(()=>{

		cargando.classList.add("cargandoOff");
		document.querySelectorAll(".instanciar").forEach(res => res.removeAttribute("style"));

		setTimeout(()=>{
			cargando.style.display = "none";
		}, 500)
	}, 2000)

}

const cargar = document.getElementById("img-cargar");
const valueCarga = document.getElementById("valueCargando")
let recursosCargados = 1;
let intentosError = 0;

let reinicio = true;

let carImg, chequearB;



chequear();

function cargaImg(carImg){

	if(carImg.complete) {
		recursosCargados++;

		if(recursosCargados == 25){
			valueCarga.textContent = "100%";
			offSectionCarga();
		} else {
			chequear();
		}
	}

}

function eliminar(e){
	setTimeout(()=>{
		containerCargando.removeChild(e);
	}, 5000)
}

function chequear(er){

	l = document.createElement("img");
	l.onerror = function(e) {
		alert("Slow connection, restart")
	}
	l.onload = function(e){
		cargaImg(l);
	}

	l.src = `img/${recursosCargados}.png`;
	l.classList.add("img-cargar");
	containerCargando.appendChild(l);

	if(recursosCargados == 5) valueCarga.textContent = "25%";
	if(recursosCargados == 12) valueCarga.textContent = "50%";
	if(recursosCargados == 17) valueCarga.textContent = "75%";
}

socket.emit("socketSincro", "inicial");
socket.on("globalSincro", (info)=> socket.emit("socketSincro", info));