import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Picker, Button} from 'react-native';


// talvez sea mejor agregar un boton para obtener la zona horaria con GET

export default function App() {
    const [paises, setPaises] = useState([]);
    const [paisActual, setPaisActual] = useState('');
    const [ciudadesPicker, setCiudadesPicker] = useState([]);
    const [ciudadActual, setCiudadActual] = useState('');
    const [tempCiudad, setTempCiudad] = useState('');
    const [weather, setWeather] = useState('');
    const [longitud, setLongitud] = useState('');
    const [latitude, setLatitude] = useState('');
    const [timeZone, setTimeZone] = useState ('');
    const [monedaLocal, setMonedaLocal] = useState ([]);
    const [monedaActual, setMonedaActual] = useState ('');
    const [resultado, setResultado] = useState('');

    //promise para carga de paises
    let countriesArray = [];
    let currencyListArray = [];
    
    useEffect(()=> {
      fetch('https://countriesnow.space/api/v0.1/countries/positions')
      .then(response => response.json())
      .then(data => {
        let countryInfo =data.data;
        console.log("JSON: " + countryInfo.length)
        console.log(data.data);
        countryInfo.forEach(element => {
          countriesArray.push(element.name);
        });
        setPaises(countriesArray);
      });

      //promise para carga de monedas
      fetch('https://currency-converter13.p.rapidapi.com/list', {
        method: "GET",
        headers: {
          "x-rapidapi-key": "39cf878cb2msh4750a69a4c9eb62p1ea218jsn7cfa7755ba29",
		      "x-rapidapi-host": "currency-converter13.p.rapidapi.com"
        },
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        data.forEach(element => {
          currencyListArray.push(element)
        });
        setMonedaLocal(currencyListArray);
      })
    }, []);

    let arrPickerItems  = [];
    paises.map((item, index)=>{
      if(item != undefined){
        arrPickerItems.push(<Picker.Item label={item} value={item} key={index}/>)
      }
    });

    let arrPickerCurrencies = [];
    monedaLocal.map((item, index) => {
      if(item != undefined){
        arrPickerCurrencies.push(<Picker.Item label={item} value={item} key={index}/>)
      }
    })

    return(
      
      <View style={styles.container}>

        {/* Picker de Paises */}

        <View style={styles.viewTempStyles}> 
          <Picker 
            style={styles.countriesPicker}
            selectedValue={paisActual}
            onValueChange={(itemValue, itemIndex) => {
              setPaisActual(itemValue)
              let ciudad = {"country": itemValue}

              fetch('https://countriesnow.space/api/v0.1/countries/cities', 
              {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                }, 
                body: JSON.stringify(ciudad)
              })
              .then(response => response.json())
              .then(data => {
                let ciudadesInfo = data.data;
                console.log(ciudadesInfo);
                let arrPickerCiudades  = [];
                ciudadesInfo.map((item, index)=>{
                  if(item != undefined){
                    arrPickerCiudades.push(<Picker.Item label={item} value={item} key={index}/>)
                  }
                });
                setCiudadesPicker(arrPickerCiudades);

              })
              .catch(err => console.log(err));
            }}
          >
          {arrPickerItems}
      
          </Picker>
            
          {/* Picker de ciudades */}

          <Picker
            style={styles.ciudadesPickerStyle}
            selectedValue={ciudadActual}
            onValueChange={(itemValue, itemIndex) => {
              setCiudadActual(itemValue)
              
              const apiKey = '87370707da37bfcc0b74fc8ccc7af204';
              const URL = `https://api.openweathermap.org/data/2.5/weather?q=${itemValue}&appid=${apiKey}`;
              console.log(itemValue);

              fetch(URL)
                .then(response => response.json())
                .then(data => {
                  console.log(JSON.stringify(data.main.temp));
                  let tempC = '';
                  tempC = JSON.stringify(data.main.temp);
                  let Description = '';
                  Description = JSON.stringify(data.weather[0].description);
                  let long = 0.0;
                  let lat = 0.0;
                  console.log(data.coord.lon)
                  console.log(data.coord.lat)
                  long = JSON.stringify(data.coord.lon);
                  lat = JSON.stringify(data.coord.lat);
                  console.log(long);
                  console.log(lat);
                  let celcius = tempC * 9/5 - 459.67;
                  setTempCiudad(celcius.toFixed(2));
                  setWeather(Description);
                  setLongitud(long);
                  setLatitude(lat);
                })
            }}
          >
            {ciudadesPicker}

          </Picker>
        </View>

        {/* Resultados de Temperatura de la ciudad */}

        <View style={styles.viewTempResultStyles} >
          <Text
            style={styles.textStyles}>
            Temperatura de {ciudadActual}: {tempCiudad}  °F

          </Text>

          <Text
            style={styles.textStyles}>
            Clima: {weather}

          </Text>
        </View>

        {/* Time Zone de la ciudad */}

        <View  style={styles.viewTimeZoneStyles}>
          <Button
            style = {{marginBottom: 50}}
            title="Time Zone"
            onPress={() => {
              const apiKey2 = 'BLNTTG4YU6PU';
              const URL2 = `http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey2}&format=json&by=position&lat=${latitude}&lng=${longitud}`;
              fetch(URL2)
                .then(response => response.json())
                .then(data => {
                  console.log(data.abbreviation);
                  let zoneT = data.abbreviation + ' - ' + data.zoneName + 
                              ' - Offset: ' + (data.gmtOffset/60)/60 + ' Hours';
                  setTimeZone(zoneT);
                  
              })

            }}> 
          </Button>

          {/* Resultados del time zone*/}

          <Text style={styles.textStyles}>
            {timeZone}
          </Text>
        </View>

        {/* Conversion de monedas a USD */}

        <View style={styles.viewExchangeStyles} >
          <Text style={styles.textStyles}> 
            Selecciona una Moneda Local: </Text>
          <Picker
          style={styles.currencyStyles}
            selectedValue={monedaActual}
            onValueChange={(itemValue, itemIndex) => {
              setMonedaActual(itemValue)

              let params = {
                "from-type": itemValue,
                "to-type": "USD",
                "from-value": "1"
              }
              var formBody = [];
              for (var property in params) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(params[property]);
                formBody.push(encodedKey + "=" + encodedValue);
              }
              formBody = formBody.join("&");

              fetch("https://community-neutrino-currency-conversion.p.rapidapi.com/convert", {
                method: "POST",
                headers: {
                  "content-type": "application/x-www-form-urlencoded",
                  "x-rapidapi-key": "39cf878cb2msh4750a69a4c9eb62p1ea218jsn7cfa7755ba29",
                  "x-rapidapi-host": "community-neutrino-currency-conversion.p.rapidapi.com"
                },
                body: formBody
              })
              .then(response => response.json())
              .then(data => {
                console.log(data);
                console.log(data.result);
                let result = data.result;
                setResultado(result);
              })

            }}
          >
            {arrPickerCurrencies}

          </Picker>

          {/* Resultado de conversion de monedas  */}

          <Text 
          style={styles.textStyles}>
            Conversion: 1 USD =  {resultado}    {monedaActual}
          </Text>
        </View>
      </View>
    );
  
}

const styles = StyleSheet.create({

  viewTempStyles: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'

  },

  viewTempResultStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },

  viewTimeZoneStyles: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },

  viewExchangeStyles: {
    flex: 2.5,
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  
  currencyStyles:{
    height: 50,
    width: 190,
    backgroundColor: '#B1D4E0',
    borderBottomColor: '#bbb',
    borderBottomWidth: 2,
    alignItems: 'center'
  },
  
  textStyles: {
    fontSize: 18,
    color: '#EBEBEB',
    fontFamily: 'cursive',
    wordSpacing: 3,
    marginBottom: 10
    
  },

  countriesPicker:{
    height: 50,
    width: '60%',
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: '#B1D4E0',
    borderBottomColor: '#bbb',
    borderBottomWidth: 2,
    alignItems: 'center'
  },

  ciudadesPickerStyle:{
    height: 50,
    width: '60%',
    marginBottom: 15,
    backgroundColor: '#B1D4E0',
    borderBottomColor: '#bbb',
    borderBottomWidth: 2,
    alignItems: 'center'
  },

  container: {
    flex:1,
    backgroundColor: '#145DA0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  
  },
}); 