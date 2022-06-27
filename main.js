console.log("Hello, Mani");
//alert("Hi I am learning JS");
//let output1 = document.getElementById('output1');
//let output2 = document.getElementById('output1');
let co2values = [{agency:"HSL",mode:"",avg:"",pavg:""},{agency:"VR",mode:"",avg:"",pavg:""}]
//console.log(co2values[1]);
let fplace = document.getElementById("fplace");
let tplace = document.getElementById("tplace");
let btn = document.getElementById("btn");
btn.addEventListener('click', event => {
  let from_value = fplace.options[fplace.selectedIndex].value;
  let to_value = tplace.options[tplace.selectedIndex].value;
  console.log(from_value);
  console.log(to_value);
  g_query(from_value,to_value, query1);
  //g_query(from_value,to_value, query2);
});



/* const reader = new FileReader();
reader.onload = function (event) {
  console.log(event.target.result); // the CSV content as string
};
reader.readAsText("./finland_co2.csv");

reader.onload = function (e) {
  const text = e.target.result;
  const data = csv_To_Array(text);
  console.log(data);
};*/

//import { writeFileSync } from "fs";
//import csv from "csvtojson";
//import { Parser } from "json2csv";

/*(async () => {

    // Load the cars
    const datavalues = await csv().fromFile("finland_co2.csv");

    // Show the cars
    console.log(datavalues);

    const data = csv_To_Array(datavalues);
    console.log(data);

    // Modify the cars
    //cars[0].Year = 1998;

    // Saved the cars
    //const carsInCsv = new Parser({ fields: ["Year", "Make", "Model", "Length"] }).parse(cars);
    //writeFileSync("cars.csv", carsInCsv);

})();
*/
let data1 = {};
let query1 = `query getData($from: String!, $to: String!){
  plan(
    fromPlace: $from,
    toPlace: $to
  ) {
    itineraries {
      duration
      startTime
      legs {
        mode
        duration
        from {
          name
          stop {
            code
            name
          }
        }
        to {
          name
        }
        agency {
          gtfsId
          name
        }
        distance
      }
    }
  }
}`;
let query2 = `query getData($from: String!, $to: String!){
  plan(
    fromPlace: $from,
    toPlace: $to, numItineraries:1, transportModes: [{mode: CAR}]
  ) {
    itineraries {
      duration
      startTime
      legs {
        mode
        duration
        from {
          name
          stop {
            code
            name
          }
        }
        to {
          name
        }
        agency {
          gtfsId
          name
        }
        distance
      }
    }
  }
}`;

function g_query(from, to, query) {
  fetch('https://api.digitransit.fi/routing/v1/routers/finland/index/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: query,
      variables: {"from": from, "to": to}
    }),
    headers: {
        'content-type': 'application/json'
    }
  }).then(async (data) => {
      // Console log our return data
      //console.log(await data.json());
      data1 = ((await data.json())); 
      //console.log( data1.data.plan.itineraries.length);
      document.getElementById('output2').innerHTML = "Calculating";

      const set = new Set([]);
      let co2cal = Array.from(set);
      for(let i = 0; i < data1.data.plan.itineraries.length; i++){
        //console.log(data1.data.plan.itineraries[i].legs['0']);
        let legsl =  data1.data.plan.itineraries[i].legs.length;
        let co2c = 0;
        for (let l=0; l<legsl; l++){
          let leg_i = data1.data.plan.itineraries[i].legs[l];
          console.log(leg_i.mode);
          if(leg_i.mode == 'WALK'){
              co2c = co2c + leg_i.distance * 0;
              console.log("i am in walk");
          }else if(leg_i.mode == 'RAIL'){
            co2c = co2c + leg_i.distance * 0.001 * 2.3;
            console.log("i am in rail");
          }else if(leg_i.mode == 'AIRPLANE'){
            co2c = co2c + leg_i.distance * 0.001 * 150;
            console.log("i am in airplane");
          }else if(leg_i.mode == 'BUS'){
            co2c = co2c + leg_i.distance * 0.001 * 37.6;
            console.log("i am in bus");
          }else if(leg_i.mode == 'SUBWAY'){
            co2c = co2c + leg_i.distance * 0;
            console.log("i am in subway");
          }else if(leg_i.mode == 'FERRY'){
            co2c = co2c + leg_i.distance * 0.001 * 389;
            console.log("i am in ferry");
          }else if(leg_i.mode == 'CAR'){
            co2c = co2c + leg_i.distance * 0.001 * 131;
            console.log("i am in car");
          }
        }
        //console.log(co2c);
        //console.log(data1.data.plan.itineraries[i].duration)
        let duration = data1.data.plan.itineraries[i].duration
        let durs = duration%60;
        let durationm = duration/60;
        let durm = durationm%60;
        let durh = durationm/60;
        let dur = durh.toFixed(0) + ':' + durm.toFixed(0) + ':' + durs.toFixed(0);
        co2cal[i] = [dur];
        //console.log(data1.data.plan.itineraries[i].startTime);
        co2cal[i].push(timeConverter(data1.data.plan.itineraries[i].startTime));
        co2cal[i]['2'] = (co2c/1000).toFixed(2);
        console.log(co2cal);

      }
      let generatedHtml
      for(i=0; i<co2cal.length; i++){
        generatedHtml = generatedHtml +`<div class="grocery_item">
                                          <div class="item">Itinerary num: ${i+1}</div><br>
                                          <div class="item">duration: ${co2cal[i][0]}</div><br>
                                          <div class="item">Start time: ${co2cal[i][1]}</div><br>
                                          <div class="item">co2: ${co2cal[i][2]} kg</div><br>
                                        </div>`;
      }

      document.getElementById('container').innerHTML = generatedHtml;
      //document.getElementById('output1').innerHTML = data1.data.plan.itineraries.length;
      
      //alert(data1);

  });
}
//g_query();
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

function flatten1 (obj, prefix, current) {
  prefix = prefix || []
  current = current || {}
  console.log(typeof(obj));
  // Remember kids, null is also an object!
  if (typeof (obj) === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      this.flatten(obj[key], prefix.concat(key), current)
    })
  } else {
    current[prefix.join('.')] = obj
    console.log(current);
  }

  return current
}

function flatten(data) {
  var result = {};
  function recurse (cur, prop) {
      if (Object(cur) !== cur) {
          result[prop] = cur;
          console.log(result);
      } else if (Array.isArray(cur)) {
           for(var i=0, l=cur.length; i<l; i++){
               recurse(cur[i], prop + "[" + i + "]");
               console.log("Lalitha");
           }
          if (l == 0){
              result[prop] = [];
              //console.log(result);
          }
      } else {
          var isEmpty = true;
          for (var p in cur) {
              isEmpty = false;
              recurse(cur[p], prop ? prop+"."+p : p);
              console.log("Mani");
          }
          if (isEmpty && prop){
              result[prop] = {};
              //console.log(result);
          }
      }
  }
  recurse(data, "");
  return result;
}

function csv_To_Array(str, delimiter = ",") {
  const header_cols = str.slice(0, str.indexOf("\n")).split(delimiter);
  const row_data = str.slice(str.indexOf("\n") + 1).split("\n");
  const arr = row_data.map(function (row) {
    const values = row.split(delimiter);
    const el = header_cols.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

/*let grocery_list = {
  "Banana": { category: "produce", price: 5.99 },
  "Chocolate": { category: "candy", price: 2.75 },
  "Wheat Bread": { category: "grains and breads", price: 2.99 }
};

// since "grocery_list" is an object (not an array) we have do Object.keys()
let generatedHtml = Object.keys(grocery_list).reduce((accum, currKey) => accum +
  `<div class="grocery_item">
    <div class="item">${currKey}</div>
    <div class="category">${grocery_list[currKey].category}</div>
    <div class="price">${grocery_list[currKey].price}</div>
  </div>`, '');

document.getElementById('container').innerHTML = generatedHtml;

*/



