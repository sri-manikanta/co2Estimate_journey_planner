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
      //document.getElementById('output2').innerHTML = "Calculating";

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


