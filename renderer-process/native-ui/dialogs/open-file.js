const {ipcRenderer} = require('electron')
const fs = require('fs')
const {PythonShell} = require("python-shell");
const p = require("path")

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
        //swal("yooo")
        document.getElementById('successM').innerHTML = `Vous avez choisi "${filename}", ce veuillez procedez vers l'étape suivante`
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
          document.getElementById('seqRes').innerHTML = `
          <p>Longer DESC ..... Or not.</p>
          <button class="demo-button" id="showSeq">Choisir un fichier</button>
          <span class="demo-response" style="color : #c0392b" id="errorSeqM"></span>
          <h5>Séquence :</h5>
          <pre id="sequence">${seq}</pre>
          `
        })
      }
    })


  }else{
    document.getElementById('errorSeqM').innerHTML = `Veuillez importer un fichier PDB avant cette étape`
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
    document.getElementById('errorSeqM').innerHTML = `Veuillez importer un fichier PDB avant cette étape`
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
      }
    })
  }else{
    document.getElementById('errorSeqM').innerHTML = `Veuillez importer un fichier PDB avant cette étape`
  }
})
