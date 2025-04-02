const express = require("express");
const app = express();
const path = require("path");

//settings
app.set("port", process.env.PORT || 3000);

console.log("hwaehisd");

//static files
app.use(express.static(path.join(__dirname + '/public')));
// console.log(__dirname + "/public")

//start server
const server = app.listen(app.get("port"), ()=>{
	console.log("Servidor Iniciado");
});

//WebSocket

const SocketIO = require("socket.io");
const io = SocketIO(server);


//Jugadores
let control1 = false;
let control2 = false;

let control1Id = "";
let control2Id = "";

let control1Turno;
let control2Turno;

let puntuacionBlue = 0;
let puntuacionRed = 0;
//
let play = false;
let turno = 0;

let completados = [];
// let completados = [[14, 5, "red"], [15, 2, "blue"]]
//Primero el Numero de carta, segundo el tipo de carta y tercero el color

let cartas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let cartasHTML = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

startN = 0; //Contador de las cartas, en total 48
startB = false;




function comprobarCartas(){


	completados.forEach(function(res){
		if(res != 0){
			io.emit("activarCart", {numCart: res.numCart, typeCart: res.typeCart, color: res.color});

		}
	})

}

let agarrarCarta1 = null;
let agarrarCarta2 = null;

let carta1Num = null;
let carta2Num = null;












//No hace falta meter todo en el método "connection", no es un update...
io.on('connection', (socket)=>{

	console.log("Unido al servidor", socket.id);


	function reset(){

		play = false;
		puntuacionBlue = 0;
		puntuacionRed = 0;
		io.emit("puntuacion", {blue: puntuacionBlue, red: puntuacionRed});

		agarrarCarta1 = null;
		agarrarCarta2 = null;

		carta1Num = null;
		carta2Num = null;

		control1 = false;
		control1Id = "";

		control2 = false;
		control2Id = "";

		cartas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

		cartasHTML = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          	  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        completados = [];

        io.emit("textTurn", "Turno: Waiting players...");

		startN = 0;
		startB = false;

		// io.emit(sincronizacion("controles"));
		io.emit("globalSincro", "controles");
		io.emit("reset"); //Todas cartas giradas

		// start(); 

	}

	socket.on("reset", function(){

		// start();

	})

	// start();

	function start(){


		// console.log("De nuevo");

		if(!startB){
			setTimeout(()=>{
				getNum();
				start();
			}, 25)
		}

	}

	function getNum(){


		let num = Math.round(Math.random()*23); // 0 - 23

		if(cartas[num] < 2){

			// console.log("getNum");

			cartasHTML[startN] = num + 1;

			startN++;

			cartas[num] += 1;


			if(startN == 48){
				startB = true;

				console.log("startON");

				play = true;

				turnoInicial();

				io.emit("activeAudio");

			

			}
		}

	}


	function turnoInicial(){

		turno = Math.round(Math.random()*3);

		if(turno == 0 || turno == 3){
			turnoInicial();
		} else {

			turno == 1 ? io.emit("textTurn", "Turno: Blue (Name)") : io.emit("textTurn", "Turno: Red (Name)");

			
		}

	}

	socket.on("seeCart", info=>{

		if(socket.id == control1Id && turno == 1){

			if((play == true) && control1Id != "" && control2Id != ""){

				verificarCart(info);

			}

		}

		if(socket.id == control2Id && turno == 2){

			if((play == true) && control1Id != "" && control2Id != ""){

				verificarCart(info);

			}

		}
	})

	socket.on("disconnect", ()=>{
		if(socket.id == control1Id && socket.id == control2Id){
			reset();
			// io.emit("globalSincro");
			return;
		} else {

			if(control1Id == socket.id){
				control1 = false;
				control1Id = "";
				// io.emit("socketSincro", "controles");
				// console.log("desconectadrControl")
			}

			if(control2Id == socket.id){
				control2 = false;
				control2Id = "";
				// console.log("desconectadrControl")
			}

			if(startB){
				if(control1Id == "" || control2Id == ""){
					reset();
				}
			} else {
				io.emit("globalSincro", "controles");
			}
		}
	})

	socket.on("mensaje", (info)=>{
		io.emit("mensaje", info);
		
	});

	socket.on("resetGame", ()=>{
		io.emit("resetGame");
	})

	socket.on("start", ()=>{
		io.emit("start");
	})

	socket.on("cartaInvoke", info=>{
		io.emit("cartaInvoke", info);
	});

	socket.on("sincronizacion", info =>{
		sincronizacion();
	})

	socket.on("controles", num =>{


		if(num == 1 && socket.id != control1Id && socket.id != control2Id){
			control1 = true;
			control1Id = "";
			control1Id = socket.id;
			io.emit("offControl1", "on");

		} else if (num == 2 && socket.id != control1Id && socket.id != control1Id){
			control2 = true;
			control2Id = "";
			control2Id = socket.id;
			io.emit("offControl2", "on");
		}

		if(control1 && control2){
			io.emit("textTurn", "Turno: Loading round...");
			start();
		}
		
		//Actualizar estado de controles
		io.emit("globalSincro", "controles");
	
	});

	socket.on("socketSincro", function(info){
		control1 == true ? io.emit("offControl1", "on") : io.emit("offControl1", "off")
		control2 == true ? io.emit("offControl2", "on") : io.emit("offControl2", "off")

			// if(!control1 == true) io.emit("offControl1", "off");
			// if(!control2 == true) io.emit("offControl2", "off");

			comprobarCartas();


			if(info == "controles"){
				return;
			}

			if(info == "inicial"){

				if(turno == 1 || turno == 2){
					turno == 1 ? socket.emit("textTurn", "Turno: Blue (Name)") : socket.emit("textTurn", "Turno: Red (Name)");
					socket.emit("puntuacion", {blue: puntuacionBlue, red: puntuacionRed});
				}else{
					if(control1 && control2) socket.emit("textTurn", "Turno: Loading round...");
					else socket.emit("textTurn", "Turno: Waiting players...");
				}

			} 

	});

	function verificarCart(info){

		let op = true;

		info = info + 1;

		completados.forEach(function(res){
			if(res == info){
				// Elige otra carta
				op = false;
				return;
			}
		})

		if(!op){
			return;
		}

		if(agarrarCarta1 == null){
			agarrarCarta1 = info;
			carta1Num = cartasHTML[info - 1];
			// carta1Num = Math.floor(cartasHTML[info - 1] * 0.5);
		} else if(agarrarCarta2 == null){
			agarrarCarta2 = info;
			if(agarrarCarta2 != agarrarCarta1){
				carta2Num = cartasHTML[info - 1];
				// carta2Num = Math.floor(cartasHTML[info - 1] * 0.5);
			} else {
				agarrarCarta2 = null;
				return;
			}
		}

		turno == 1 ? io.emit("leeCart", {numCart: info, typeCart: cartasHTML[info - 1], color: "blue"})
				   : io.emit("leeCart", {numCart: info, typeCart: cartasHTML[info - 1], color: "red"})
		

		if((carta1Num != null) && carta2Num != null){
			console.log(carta1Num);
			console.log(carta2Num);
			if(carta1Num == carta2Num){

				if(turno == 2){
					puntuacionRed += 2;
					completados.push({numCart: agarrarCarta1, typeCart: cartasHTML[info - 1], color: "red"});
					completados.push({numCart: agarrarCarta2, typeCart: cartasHTML[info - 1], color: "red"});

				} else {
					puntuacionBlue += 2;
					completados.push({numCart: agarrarCarta1, typeCart: cartasHTML[info - 1], color: "blue"});
					completados.push({numCart: agarrarCarta2, typeCart: cartasHTML[info - 1], color: "blue"});

				}

				io.emit("puntuacion", {blue: puntuacionBlue, red: puntuacionRed});


				agarrarCarta1 = null;
				agarrarCarta2 = null;

				carta1Num = null;
				carta2Num = null;

				if(completados.length == 48){

					play = false;

					setTimeout(()=>{

						if(turno == 2){
							io.emit("textTurn", "Ganador: Red (Name)")
						} else {
							io.emit("textTurn", "Ganador: Blue (Name)")
						}

						setTimeout(()=>{

							io.emit("textTurn", "Reiniciando Juego...")

							setTimeout(()=>{

								reset();

							}, 3000)

						}, 5000)

					}, 250)


				}



			}else{

				play = false;
				
				setTimeout(()=>{

					if(turno == 2){
						turno = 1;
					} else {
						turno = 2;
					}

					turno == 1 ? io.emit("textTurn", "Turno: Blue (Name)") : io.emit("textTurn", "Turno: Red (Name)");

					io.emit("girarCart", agarrarCarta1);
					io.emit("girarCart", agarrarCarta2);

					agarrarCarta1 = null;
					agarrarCarta2 = null;

					carta1Num = null;
					carta2Num = null;

					play = true;

				}, 500)
				
			}
		}
	}

});

