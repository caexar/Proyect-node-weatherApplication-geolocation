const fs = require("fs");

const axios = require("axios");


class Busquedas{
    historial = [];
    dbPath = "./db/database.json";

    constructor(){
        this.leerDB();
    }

    get paramsMapbox(){
        return {
            "access_token": process.env.MAPBOX_KEY,
            "limit": 5,
            "language": "es"
        }
    }

    get paramsOPENWEATHER(){
        return{ 
            appid: process.env.OPENWEATHER_KEY,
            units: "metric",
            lang: "es"

        }
    }

    get historialCapitalizado(){
        return this.historial.map( lugar => {

            let palabras = lugar.split(" ");
            palabras = palabras.map(p =>p[0].toUpperCase() + p.substring(1));

            return palabras.join(" ");
        })
    }



    async ciudad(lugar = ''){
        //peticion http

        try {
            // peticion http
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json `,
                params: this.paramsMapbox   
            });

            const resp = await intance.get();
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));

            
        } catch (error) {
            return [];
        }
    }

    async climaLugar( lat, lon){
        try {
            
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}`,
                params: { ...this.paramsOPENWEATHER, lat, lon}
            });
            const resp = await instance.get();
            const {weather, main} = resp.data;

            return {
                desc: weather[0].description, //la descripcion estaba dentro de un array por eso el [0]
                tempe: main.temp,
                min: main.temp_min,
                max: main.temp_max,
            };

            


        } catch (error) {
            console.log(error);
        }
    }


    agregarHistorial( lugar = ""){

        //prevenir repetido
        if(this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }
        //esto es para que solo tenga un max de 5 ciudades el historial
        this.historial = this.historial.splice(0,4);

        this.historial.unshift( lugar.toLocaleLowerCase());

        //grabar en bd
        this.guardarDB();
    }

    guardarDB(){
        const payload = {
            historial: this.historial
        };

        fs.writeFileSync( this.dbPath, JSON.stringify(payload));
    }


    leerDB(){

        //debe de exisitr
        if (!fs.existsSync(this.dbPath)) return;
        

        //cargar la info
        const info = fs.readFileSync(this.dbPath, {encoding: "utf-8"});
        const data = JSON.parse(info);

        this.historial = data.historial;
    }
}



module.exports = Busquedas;