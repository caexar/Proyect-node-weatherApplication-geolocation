require('dotenv').config()

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
    
    const busquedas = new Busquedas();
    let otp;

    do {

        otp = await inquirerMenu();
        
        switch (otp) {
            case 1:
                //mostrar mensaje
                const terminoBusqueda = await leerInput("Ciudad: ");
            
                //buscar los lugares
                const lugares = await busquedas.ciudad(terminoBusqueda);
                
                //seleccionar el lugar
                const id = await listarLugares(lugares);
                if (id === "0") continue;
                   
                const lugarSeleccionado = lugares.find(l => l.id === id);
                //console.log({lugarSeleccionado});

                //guardar bd
                busquedas.agregarHistorial( lugarSeleccionado.nombre);

                //dato de clima
                const clima = await busquedas.climaLugar(lugarSeleccionado.lat, lugarSeleccionado.lng);
    
                //console.log("clima: "+climaSeleccionado);

                //mostrar resultados
                console.clear();
                console.log("\nInformacion de la ciudad\n".green);
                console.log("Ciudad:", lugarSeleccionado.nombre);
                console.log("Lat:", lugarSeleccionado.lat);
                console.log("Lng:", lugarSeleccionado.lng);
                console.log("Temperatura:", clima.tempe);
                console.log("Minima:", clima.min);
                console.log("Maxima:", clima.max);
                console.log("Como esta el clima:", clima.desc);

            break;
        
            case 2:
            busquedas.historialCapitalizado.forEach((lugar, i) => {
                const idx = `${i + 1},`.green;
                console.log(`${ idx} ${lugar}`);
            })

            break;
        }


        if (otp !==0) await pausa();

    } while (otp!== 0);


}

main();