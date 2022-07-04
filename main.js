let co2values = [{agency:"HSL",mode:"",avg:"",pavg:""},{agency:"VR",mode:"",avg:"",pavg:""}]
let co2caldata ;
let fplace = document.getElementById("fplace");
let tplace = document.getElementById("tplace");
let btn = document.getElementById("btn");
btn.addEventListener('click', event => {
  let from_value = fplace.options[fplace.selectedIndex].value;
  let to_value = tplace.options[tplace.selectedIndex].value;
  console.log(from_value);
  console.log(to_value);
  g_query(from_value,to_value, query1);
  g_query_car(from_value,to_value, query2);
});



let data1 = {};
let query1 = `query getData($from: String!, $to: String!){
  plan(
    fromPlace: $from,
    toPlace: $to, numItineraries:5
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

      const set = new Set([]);
      let co2cal = Array.from(set);
      for(let i = 0; i < data1.data.plan.itineraries.length; i++){
        //console.log(data1.data.plan.itineraries[i].legs['0']);
        let legsl =  data1.data.plan.itineraries[i].legs.length;
        let co2i = 0;
        let duration = data1.data.plan.itineraries[i].duration;
        let durs = duration%60;
        let durationm = duration/60;
        let durm = durationm%60;
        let durh = durationm/60;
        let dur = durh.toFixed(0) + ':' + durm.toFixed(0) + ':' + durs.toFixed(0);
        co2cal[i] = [dur];
        co2cal[i].push(timeConverter(data1.data.plan.itineraries[i].startTime));
        co2cal[i]['3'] = [];
        for (let l=0; l<legsl; l++){
          let leg_i = data1.data.plan.itineraries[i].legs[l];
          console.log(leg_i.mode);
          co2cal[i]['3'][l] = [leg_i.mode];
          co2cal[i]['3'][l]['1'] = leg_i.duration;
          co2cal[i]['3'][l]['2'] = leg_i.from.name;
          co2cal[i]['3'][l]['3'] = leg_i.to.name;
          if(leg_i.agency){
            co2cal[i]['3'][l]['4'] = leg_i.agency.name;
          } else {
            co2cal[i]['3'][l]['4'] = 'None';
          }
          co2cal[i]['3'][l]['5'] = leg_i.distance;
          let co2l = 0;
          if(leg_i.mode == 'WALK'){
              co2l = leg_i.distance * 0;
              console.log("i am in walk");
          }else if(leg_i.mode == 'RAIL'){
            co2l = leg_i.distance * 0.001 * 2.3;
            console.log("i am in rail");
          }else if(leg_i.mode == 'AIRPLANE'){
            co2l = leg_i.distance * 0.001 * 150;
            console.log("i am in airplane");
          }else if(leg_i.mode == 'BUS'){
            co2l = leg_i.distance * 0.001 * 37.6;
            console.log("i am in bus");
          }else if(leg_i.mode == 'SUBWAY'){
            co2l = leg_i.distance * 0;
            console.log("i am in subway");
          }else if(leg_i.mode == 'FERRY'){
            co2l = leg_i.distance * 0.001 * 389;
            console.log("i am in ferry");
          }else if(leg_i.mode == 'CAR'){
            co2l = leg_i.distance * 0.001 * 131;
            console.log("i am in car");
          }
          co2cal[i]['3'][l]['6'] = (co2l/1000).toFixed(2);
          co2i = co2i+co2l;
        }
        
        co2cal[i]['2'] = (co2i/1000).toFixed(2);
        console.log(co2cal);

      }
      let generatedHtml = ``;
      for(i=0; i<co2cal.length; i++){
        generatedHtml = generatedHtml +`<div class="grocery_item">
                                          <div class="item">Itinerary num: ${i+1}</div>
                                          <input type="radio" id=itinary${i} name="legs" value="ind_leg"><br>
                                          <div class="item">duration: ${co2cal[i][0]}</div><br>
                                          <div class="item">Start time: ${co2cal[i][1]}</div><br>
                                          <div class="item">co2: ${co2cal[i][2]} kg equivalent for the production of ${(co2cal[i][2]*66.67).toFixed(2)} g of Beef</div><br>
                                        </div>`;
      }

      document.getElementById('container').innerHTML = generatedHtml;
      co2caldata = co2cal;
      let indi_leg_0 = document.getElementById("itinary0");
      indi_leg_0.addEventListener('click', event => {
        indi(0);
      });
      let indi_leg_1 = document.getElementById("itinary1");
      indi_leg_1.addEventListener('click', event => {
        indi(1);
      });
      let indi_leg_2 = document.getElementById("itinary2");
      indi_leg_2.addEventListener('click', event => {
        indi(2);
      });
      let indi_leg_3 = document.getElementById("itinary3");
      indi_leg_3.addEventListener('click', event => {
        indi(3);
      });
      let indi_leg_4 = document.getElementById("itinary4");
      indi_leg_4.addEventListener('click', event => {
        indi(4);
      });

  });
}
function indi(iti){
  let generatedHtml2 = ``;
      console.log(co2caldata[iti]["3"]);
      for(i=0; i<co2caldata[iti]["3"].length; i++){
        generatedHtml2 = generatedHtml2 +`<div class="grocery_item">
                                          <div class="item">mode: ${co2caldata[iti]["3"][i]["0"]}</div>
                                          <div class="item">duration: ${co2caldata[iti]["3"][i]["1"]} </div>
                                          <div class="item">from: ${co2caldata[iti]["3"][i]["2"]}</div>
                                          <div class="item">to: ${co2caldata[iti]["3"][i]["3"]}</div>
                                          <div class="item">agency: ${co2caldata[iti]["3"][i]["4"]}</div>
                                          <div class="item">distance: ${co2caldata[iti]["3"][i]["5"]}</div>
                                          <div class="item">co2: ${co2caldata[iti]["3"][i]["6"]}</div>
                                        </div>`;  
              
      }
      document.getElementById('container2').innerHTML = generatedHtml2;
}
function g_query_car(from, to, query) {
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
        let co2i = 0;
        let duration = data1.data.plan.itineraries[i].duration
        let durs = duration%60;
        let durationm = duration/60;
        let durm = durationm%60;
        let durh = durationm/60;
        let dur = durh.toFixed(0) + ':' + durm.toFixed(0) + ':' + durs.toFixed(0);
        co2cal[i] = [dur];
        co2cal[i].push(timeConverter(data1.data.plan.itineraries[i].startTime));
        for (let l=0; l<legsl; l++){
          let leg_i = data1.data.plan.itineraries[i].legs[l];
          console.log(leg_i.mode);
          co2cal[i]['3'] = [leg_i.mode];
          co2cal[i]['3']['1'] = leg_i.duration;
          co2cal[i]['3']['2'] = leg_i.from.name;
          co2cal[i]['3']['3'] = leg_i.to.name;
          if(leg_i.agency){
            co2cal[i]['3']['4'] = leg_i.agency.name;
          } else {
            co2cal[i]['3']['4'] = 'None';
          }
          co2cal[i]['3']['5'] = leg_i.distance;
          let co2l = 0;
          if(leg_i.mode == 'WALK'){
              co2l = leg_i.distance * 0;
              console.log("i am in walk");
          }else if(leg_i.mode == 'RAIL'){
            co2l = leg_i.distance * 0.001 * 2.3;
            console.log("i am in rail");
          }else if(leg_i.mode == 'AIRPLANE'){
            co2l = leg_i.distance * 0.001 * 150;
            console.log("i am in airplane");
          }else if(leg_i.mode == 'BUS'){
            co2l = leg_i.distance * 0.001 * 37.6;
            console.log("i am in bus");
          }else if(leg_i.mode == 'SUBWAY'){
            co2l = leg_i.distance * 0;
            console.log("i am in subway");
          }else if(leg_i.mode == 'FERRY'){
            co2l = leg_i.distance * 0.001 * 389;
            console.log("i am in ferry");
          }else if(leg_i.mode == 'CAR'){
            co2l = leg_i.distance * 0.001 * 131;
            console.log("i am in car");
          }
          co2cal[i]['3']['6'] = (co2l/1000).toFixed(2);
          co2i = co2i+(co2l/1000).toFixed(2);
        }
        //console.log(co2c);
        //console.log(data1.data.plan.itineraries[i].duration)
        
        
        //console.log(data1.data.plan.itineraries[i].startTime);
        
        co2cal[i]['2'] = co2i;
        console.log(co2cal);

      }
      let generatedHtml = ``;
      for(i=0; i<co2cal.length; i++){
        generatedHtml = generatedHtml +`<div class="grocery_item">
                                          <div class="item">Travel by Car</div>
                                          <div class="item">duration: ${co2cal[i][0]}</div><br>
                                          <div class="item">Start time: ${co2cal[i][1]}</div><br>
                                          <div class="item">co2: ${co2cal[i][2]} kg equivalent for the production of ${(co2cal[i][2]*66.67).toFixed(2)} g of Beef</div><br>
                                        </div>`;
      }

      
      document.getElementById('container1').innerHTML = generatedHtml;
      
      //alert(data1);

  });
}
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
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

function emissiondata(){
  fetch(`./finland_co2.txt`)
  .then(response => response.text())
  .then(data => {
  	// Do something with your data
  	console.log(data);
  });
}




