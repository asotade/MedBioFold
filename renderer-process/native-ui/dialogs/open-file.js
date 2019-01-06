const {ipcRenderer} = require('electron');
const fs = require('fs');
const {PythonShell} = require("python-shell");
const p = require("path");
const swal = require("sweetalert");
const toastr = require("toastr")
const G2 = require("@antv/g2")

const selectDirBtn = document.getElementById('select-directory')

selectDirBtn.addEventListener('click', (event) => {
  document.getElementById('ErrorM').innerHTML = ""
  document.getElementById('successM').innerHTML = ""
  ipcRenderer.send('open-file-dialog')
})

ipcRenderer.on('selected-directory', (event, path) => {
  let splittedPath = (""+path).split(".")
  let ext = splittedPath[splittedPath.length-1]
  //console.log("ext :",ext)
  if(ext!="pdb" && ext!="PDB")
  {
    const filename = (""+path).split("/")[((""+path).split("/")).length-1]
    document.getElementById('ErrorM').innerHTML = `le fichier "${filename}" n'est pas un fichier PDB`
  }else{
    fs.writeFile("WD/filepath.temp",path,(err)=>{
      if(!err){
        const filename = (""+path).split("/")[((""+path).split("/")).length-1]
        swal("Succès",`Vous avez choisi "${filename}", veuillez procedez vers l'étape suivante`,"success")
        //document.getElementById('successM').innerHTML =
      }else{
        //toastr.warning(err.reason)
        document.getElementById('ErrorM').innerHTML = `"${err}"`
      }
    })
      }
})



const runPyBtn = document.getElementById('testPython')
runPyBtn.addEventListener("click",(event)=>{

  message = document.getElementById('namu').value
  document.getElementById('namu').value = ""

  let options = {
    scriptPath : p.join(__dirname,"/../../../pythonScripts/"),
    args : [message]
  }

  var proc = new PythonShell('helloworld.py',options)

  proc.on('message',(message)=>{
    console.log(message)
  })

})


const showSeqBtn = document.getElementById('showSeq')
showSeqBtn.addEventListener("click",(e)=>{

  //document.getElementById('errorSeqM').innerHTML = ""

  const filepath = "WD/filepath.temp"
  if (fs.existsSync(filepath)) {

    fs.readFile(filepath,"utf-8",(err,pdbFile)=>{
      if(!err){
        let options = {
          scriptPath : p.join(__dirname,"/../../../pythonScripts/"),
          args : [pdbFile]
        }

        var proc = new PythonShell('getSequenceFromFile.py',options)

        proc.on('message',(message)=>{

          let seq = "";

          for(i = 0;i<message.length/40;i++){
            seq += `<p> ${message.substring(i,i+40)} </p>`
          }
          if(message.length%40 > 0){
            seq+= `<p> ${message.substring(message.length-message.length%50,message.length)} </p>`
          }
          document.getElementById('seqRes').innerHTML = document.getElementById('seqRes').innerHTML +
          `
          <h5>Séquence :</h5>
          <pre id="sequence">${seq}</pre>
          `
        })
      }
    })


  }else{
    swal ( "Oops" ,  "Veuillez importer un fichier PDB avant cette étape!" ,  "error" )
    //document.getElementById('errorSeqM').innerHTML = `Veuillez importer un fichier PDB avant cette étape`
  }

})

const showRama1Btn = document.getElementById("ViewRamachandran1")
showRama1Btn.addEventListener("click", (e)=>{
  const filepath = "WD/filepath.temp"
  if (fs.existsSync(filepath)) {
    fs.readFile(filepath,"utf-8",(err,pdbFile)=>{
      if(!err){
        let options = {
          scriptPath : p.join(__dirname,"/../../../pythonScripts/"),
          args : [pdbFile]
        }
        var proc = new PythonShell('ramachandran1.py',options)
        proc.on("message",(message)=>{
          console.log(message)
        })
      }else{
        document.getElementById('errorSeqM').innerHTML = `${err.message}`
      }
    })
  }else{
    swal ( "Oops" ,  "Veuillez importer un fichier PDB avant cette étape!" ,  "error" )
  }
})

const showRama2Btn = document.getElementById("ViewRamachandran2")
showRama2Btn.addEventListener("click", (e)=>{
  const filepath = "WD/filepath.temp"
  if (fs.existsSync(filepath)) {
    fs.readFile(filepath,"utf-8",(err,pdbFile)=>{
      if(!err){
        let options = {
          scriptPath : p.join(__dirname,"/../../../pythonScripts/"),
          args : [pdbFile]
        }
        var proc = new PythonShell('ramachandran.py',options)
        proc.on("message",(message)=>{
          fs.writeFile("WD/result.temp",message,(err)=>{
            if(!err){
              swal("Prêt!","le resultat est prêt","success")
            }else{
              swal("Oops!","Une erreur est survenu","error");
              console.log(err)
            }
          });
        });
      }
    })
  }else{
    swal ( "Oops" ,  "Veuillez importer un fichier PDB avant cette étape!" ,  "error" )
  }
})


const viewPDBBtn = document.getElementById("new-visualize-window");
viewPDBBtn.addEventListener("click", (e)=>{
  //console.log("swal here")
  const filepath = "WD/filepath.temp"
  if (fs.existsSync(filepath)) {
    fs.readFile(filepath,"utf-8",(err,pdbFile)=>{
      if(!err){
        let options = {
          //pythonPath: '/usr/bin/python',
          scriptPath : p.join(__dirname,"/../../../pythonScripts/"),
          args : [pdbFile]
        }
        var proc = new PythonShell('proteins.py',options)
      }
    })
  }else{
    swal ( "Oops" ,  "Veuillez importer un fichier PDB avant cette étape!" ,  "error" )
  }
});

const viewQualityBtn = document.getElementById("view-pdb-quality");
viewQualityBtn.addEventListener("click",(e)=>{
  const res = "WD/result.temp"
  if (fs.existsSync(res)) {
    fs.readFile(res,"utf-8",(err,result)=>{
      const splittedRes = result.split(";")
      console.log("result: ",result)
      console.log(splittedRes[1])
      let good = parseInt(splittedRes[1])
      console.log(good)
      let bad = parseInt(splittedRes[2])
      let total = parseInt(splittedRes[0])
      let unidetified = total - (good + bad)
      const data = [
        {
          item : "Normals",
          count: good,
          percent : Number((good/total).toFixed(1))
        },
        {
          item : "Outliers",
          count: bad,
          percent : Number((bad/total).toFixed(1))
        },
        {
          item : "Non-identifié",
          count: unidetified,
          percent: Number((unidetified/total).toFixed(1))
        }
      ];
      var chart = new G2.Chart({
        container: 'chartContainer',

      });

      chart.source(data, {
        percent: {
          formatter: function formatter(val) {
            val = val * 100 + '%';
            return val;
          }
        }
      });

      chart.coord('theta', {
        radius: 0.75,
        innerRadius: 0.6
      });

      chart.tooltip({
        showTitle: false,
        itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
      });

      chart.guide().html({
        position: ['50%', '50%'],
        html: `<div style="color:#8c8c8c;font-size: 14px;text-align: center;width: 10em;">Score<br><span style="color:#8c8c8c;font-size:20px">${((good/total)*100).toFixed(2)}%</span></div>`,
        alignX: 'middle',
        alignY: 'middle'
      });

      var interval = chart.intervalStack().position('percent').color('item').label('percent', {
        formatter: function formatter(val, item) {
          console.log(item);
          return item._origin.item + ': ' + val;
        }
      }).tooltip('item*percent', function(item, percent) {
        percent = percent * 100 + '%';
        return {
          name: item,
          value: percent
        };
      }).style({
        lineWidth: 1,
        stroke: '#fff'
      });

      chart.render();
      interval.setSelected(data[0]);


          })
  }else{
    swal("Oops","Veuillez voir le Ramachandran Plot avant cette étape.","error")
  }

  /*

  const chart = new G2.Chart({
    container: 'chartContainer',
    width: 500,
    height: 500
  });

  chart.source(data);
  chart.interval().position('genre*sold').color('genre');
  chart.render();
*/


/*
const data = [
  {
    item : "Normals",
    count: good,
    percent : Number((good/total).toFixed(1))
  },
  {
    item : "Outliers",
    count: bad,
    percent : Number((bad/total).toFixed(1))
  },
  {
    item : "Non-identifié",
    count: unidetified,
    percent: Number((unidetified/total).toFixed(1))
  }
];
var chart = new G2.Chart({
  container: 'chartContainer',
  forceFit: true,
  height: window.innerHeight,
  animate: false
});

chart.source(data, {
  percent: {
    formatter: function formatter(val) {
      val = val * 100 + '%';
      return val;
    }
  }
});

chart.coord('theta', {
  radius: 0.75,
  innerRadius: 0.6
});

chart.tooltip({
  showTitle: false,
  itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
});

chart.guide().html({
  position: ['50%', '50%'],
  html: `<div style="color:#8c8c8c;font-size: 14px;text-align: center;width: 10em;">Score<br><span style="color:#8c8c8c;font-size:20px">${((good/total)*100).toFixed(2)}%</span></div>`,
  alignX: 'middle',
  alignY: 'middle'
});

var interval = chart.intervalStack().position('percent').color('item').label('percent', {
  formatter: function formatter(val, item) {
    console.log(item);
    return item._origin.item + ': ' + val;
  }
}).tooltip('item*percent', function(item, percent) {
  percent = percent * 100 + '%';
  return {
    name: item,
    value: percent
  };
}).style({
  lineWidth: 1,
  stroke: '#fff'
});

chart.render();
interval.setSelected(data[0]);
*/
})
