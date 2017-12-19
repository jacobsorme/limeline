function Timeline(canvas){
  this.jobs = [];
  this.canvas = canvas;
  this.height = canvas.height;
  this.width = canvas.width;
  this.ctx = canvas.getContext("2d");
  this.id = 1;
  this.positions = [[]];
  this.date = new Date();
  this.margin = 20;
  this.lmargin = 20;
  this.rmargin = 20;
}

Timeline.prototype = {
  downloadImage(){
    document.getElementById("download").href = this.canvas.toDataURL('image/png');
  },
  getJobs: function(){
    return JSON.stringify(this.jobs);
  },
  getId: function(){
    return this.id++;
  },
  getY1: function(){
    return document.getElementById("y1").value;
  },
  getY2: function(){
    return document.getElementById("y2").value;
  },
  getY3: function(){
    return document.getElementById("y3").value;
  },
  getPos: function(year,y2,y3){
    return this.lmargin+((this.width-this.lmargin-this.rmargin)/(y3-y2)*(year-y2));
  },
  removeJob: function(id){
    for(var i in this.jobs){
      if(this.jobs[i].id ==id) this.jobs.splice(i,1);
    }
  },
  between: function(n,x1,x2){
    return Math.min(Math.max(n,x1),x2);
  },


  editJob: function(id){
    var txt = "not found";
    for(var i in this.jobs){
      if(this.jobs[i].id ==id) {
        txt = JSON.stringify(new LightJob(this.jobs[i]),null,2);
      }
    }
    document.getElementById("textarea").value = txt;
    this.removeJob(id);
  },

  render: function(){
    // init
    var y1 = this.getY1();
    var y2 = this.getY2();
    var y3 = this.getY3();
    this.ctx.lineCap="round";
    this.ctx.textBaseline="middle";
    if(y3<0) y3 = this.date.getFullYear()+1;
    this.positions.length = 5;
    for(var i in this.positions){
      this.positions[i].length = Math.max(y3-y2,0);
      this.positions[i].fill(false);
    }

    if(document.getElementById("dotdotdot").checked){
      this.lmargin = 70;
    } else { this.lmargin = this.margin; }


    this.ctx.fillStyle="#fff";
    this.ctx.fillRect(0,0,this.width,this.height);
    this.ctx.fillStyle="#000";
    this.ctx.lineWidth =2;

    // render timeline
    this.ctx.strokeStyle ="#000000";
    this.ctx.beginPath();
    this.ctx.moveTo(this.lmargin,this.height/2);
    this.ctx.lineTo(this.width-this.margin,this.height/2);
    this.ctx.stroke();
    //this.ctx.clearPath();

    //render years and marks
    this.ctx.textBaseline="alphabetic";
    var length = 5;

    //beginning, y1
    if(document.getElementById("dotdotdot").checked) {
      this.ctx.beginPath();
      this.ctx.textAlign ="center";
      this.ctx.font="12px Georgia";
      this.ctx.fillText(y1,this.margin,this.height/2+20);
      this.ctx.moveTo(this.margin,this.height/2-length);
      this.ctx.lineTo(this.margin,this.height/2+length);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(this.margin,this.height/2);
      this.ctx.lineTo(this.margin+10,this.height/2);
      this.ctx.moveTo(this.margin+20,this.height/2);
      this.ctx.lineTo(this.margin+30,this.height/2);
      this.ctx.moveTo(this.margin+40,this.height/2);
      this.ctx.lineTo(this.margin+50,this.height/2);
      this.ctx.stroke();
    }


    this.ctx.beginPath();
    this.ctx.lineWidth=2;

    this.ctx.font="12px Georgia";
    this.ctx.textAlign ="center";
    this.ctx.fillText(y2,this.lmargin,this.height/2+25);
    this.ctx.fillText(y3,this.width-this.rmargin,this.height/2+25);

    var x;
    for(var i = y2;i <=y3;i++){
      x = this.getPos(i,y2,y3);
      length = 5;
      if(i%5==0) {
        if(i!=y2) this.ctx.fillText(i,x,this.height/2+25);
        length = 12;
      }
      if(document.getElementById("allyears").checked && i%5!=0 && i!=y2 &&i!=y3) this.ctx.fillText(i,x,this.height/2+20);
      this.ctx.moveTo(x,this.height/2-length);
      this.ctx.lineTo(x,this.height/2+length);
      this.ctx.stroke();
    }

    // render occupations & Interface
    this.ctx.lineWidth=2;
    document.getElementById("jobs").innerHTML ="";
    for(var i in this.jobs){
      var job = this.jobs[i];
      //init



      //Interface
      var row = document.createElement("tr");
      var data = document.createElement("td");
      var div = document.createElement("div");
      var remove = document.createElement("input");
      var edit = document.createElement("input");
      remove.type = "button";
      edit.type = "button";
      remove.value = "Remove";
      edit.value = "Edit";

      remove.onclick=this.removeJob.bind(this,this.jobs[i].id);
      edit.onclick=this.editJob.bind(this,this.jobs[i].id);

      div.innerHTML+= (this.jobs[i].title.length==0 ? " - " : this.jobs[i].title);
      div.appendChild(edit);
      div.appendChild(remove);
      data.appendChild(div);
      row.appendChild(data);

      document.getElementById("jobs").appendChild(row);



      // occupations
      this.ctx.beginPath();
      this.ctx.textBaseline="middle";
      this.ctx.strokeStyle=this.jobs[i].color;
      this.ctx.translate(0,job.getLayer());

      this.ctx.moveTo(this.getPos(job.y1,y2,y3),this.height/2-(10*job.getLayerSign()));
      this.ctx.quadraticCurveTo(this.getPos(job.y1,y2,y3),this.height/2,this.getPos(job.y1,y2,y3)+10,this.height/2);
      if(job.y2<0){
        this.ctx.lineTo(this.getPos(this.date.getFullYear()+(this.date.getMonth()/11),y2,y3),this.height/2);
      } else {
        this.ctx.lineTo(this.getPos(job.y2,y2,y3)-10,this.height/2);
        this.ctx.quadraticCurveTo(this.getPos(job.y2,y2,y3),this.height/2,this.getPos(job.y2,y2,y3),this.height/2-(10*job.getLayerSign()));
      }
      // If this thingy is of type seasonal - dont draw the pin!
      if(job.text!=""){
        // The pin should be positioned between start of activity and end of activity.
        this.ctx.moveTo(this.getPos(job.y1,y2,y3)+this.between(job.textPosition,15,this.getPos(job.y2,y2,y3)-this.getPos(job.y1,y2,y3)-15),this.height/2);
        this.ctx.lineTo(this.getPos(job.y1,y2,y3)+this.between(job.textPosition,15,this.getPos(job.y2,y2,y3)-this.getPos(job.y1,y2,y3)-15),(10*job.getLayerSign())+this.height/2);
      }



      this.ctx.stroke();

      this.ctx.translate(job.textPosition,0);
      //title
      if(job.text!=""){
        this.ctx.font="18px Georgia";
        this.ctx.textAlign ="left";
        this.ctx.fillText(this.jobs[i].title,this.getPos(this.jobs[i].y1,y2,y3),this.height/2+25+(85*job.isLayerOver()));
      }

      //years
      this.ctx.font="11px Georgia";
      if(typeof job.showYears === "boolean" && job.showYears){
        var str1 = this.jobs[i].y1+"";
        var str2 = this.jobs[i].y2+"";
        if(str2==-1) str2="";
        this.ctx.fillText(str1.substring(0,4)+"-"+str2.substring(0,4),this.getPos(this.jobs[i].y1,y2,y3),this.height/2+40+(85*job.isLayerOver()));
      } else if(typeof job.showYears === "string"){
        this.ctx.fillText(job.showYears,this.getPos(this.jobs[i].y1,y2,y3),this.height/2+40+(85*job.isLayerOver()));
      }
      //text
      this.ctx.font="12px Georgia";
      this.ctx.fillText(this.jobs[i].text,this.getPos(this.jobs[i].y1,y2,y3),this.height/2+60+(85*job.isLayerOver()));


      this.ctx.translate(-1*job.textPosition,-job.getLayer());
    }
  }
}

function LightJob(Job){
  this.y1 = Job.y1;
  this.y2 = Job.y2;
  this.title = Job.title;
  this.text = Job.text;
  this.color = Job.color;
  this.layer = Job.layer;
  this.textPosition = Job.textPosition;
  this.showYears = Job.showYears;
}

function Job(id,input){
  this.id = id;
  this.y1 = input.y1;
  this.y2 = input.y2;
  this.title = input.title;
  this.text = input.text;
  this.color = input.color;
  this.layer = input.layer;
  this.layers = [-85,-70,-55,-40,40,55,70,85];
  this.textPosition = input.textPosition;
  this.showYears = input.showYears;
}


Job.prototype = {
  getLayer: function(){
    return this.layers[Math.max(0,this.layer)];
  },
  getLayerSign: function(){
    return Math.max(Math.min(1,this.getLayer()),-1);
  },
  isLayerOver: function(){
    return Math.min(this.getLayerSign(),0);
  }
}
