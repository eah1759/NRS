/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
/*exports.helloWorld = (req, res) => {
  let message = req.query.message || req.body.message || 'Hello World!';
  res.status(200).send(message);
};*/
import fetch from "node-fetch";

export async function helloWorld(req, res) {
  const body = await fetch("https://api.github.com/repos/eah1759/NRS/contents/Songs/");
  const payload = await body.json();
  const output = await parse(payload);
  res.send(output);
}

async function fetch_json(link) {
	const body = await fetch(link);
    const payload = await body.json();
    return payload;
}

async function fetch_raw(link) {
	const body = await fetch(link);
	const payload = await body.text();
    return payload;
}

function hexToRgb(hex) {
	//return 0;
  if(hex.length!=7)
  	return [0,0,0];
  if(hex.substring(0,1)!="#")
  	return [0,0,0];

  var rrr = 0;
  var grr = 0;
  var brr = 0;
  for(var p = 0; p < 6; p++) {
	  var tmpval
	  switch(hex.substring(1+p,2+p).toLowerCase()) {
		case "0": tmpval = 0; break;
		case "1": tmpval = 1; break;
		case "2": tmpval = 2; break;
		case "3": tmpval = 3; break;
		case "4": tmpval = 4; break;
		case "5": tmpval = 5; break;
		case "6": tmpval = 6; break;
		case "7": tmpval = 7; break;
		case "8": tmpval = 8; break;
		case "9": tmpval = 9; break;
		case "a": tmpval = 10; break;
		case "b": tmpval = 11; break;
		case "c": tmpval = 12; break;
		case "d": tmpval = 13; break;
		case "e": tmpval = 14; break;
		case "f": tmpval = 15; break;
		default: return [0,0,0];
	  }
	  if(p%2==0)
	  	tmpval = tmpval*16;
	  if(p<2) {
		rrr = rrr + tmpval;
	  } else if(p<4) {
		grr = grr + tmpval;
	  } else {
		brr = brr + tmpval;
	  }
  }
  return [rrr,grr,brr];
}

async function parse(payload) {
  var output = "";
  var otherOtherEndBit = 0;
  //var testing = await fetch_json("https://api.github.com/repositories/427456099/contents/Songs");
  //output = output + "\n" + testing[0].name;
  for(var i = 0; i < payload.length; i++) {
	var element = payload[i];
  	if(element.type.toString() == "dir") {
	  var endBit = 0;
	  var otherEndBit = 0;
	  //output = output + "\nB\n" + element.url;
	  var payload2 = await fetch_json(element.url);
      var info = ["title","artist","songlink",0.0/*songoffset*/,"jacketlink","titlecard","artistcard",0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,"000"];
      //payload2.forEach(element2 => {
	  for(var j = 0; j < payload2.length; j++) {
		var element2 = payload2[j];
      	if(element2.name.length > 4 && element2.name.substring(element2.name.length-4,element2.name.length) == ".ssi") {
          var dataTmp = await fetch_raw(element2.download_url);
		  var data = dataTmp.toString().split("\n");
		  //output = output + "\nB\n" + data + "\nC\n";
		  //data.forEach(line => {
		  for(var k = 0; k < data.length; k++) {
		  var line = data[k];
			  if(line.startsWith("#TITLE \"")) {
			  	info[0] = line.substring("#TITLE \"".length, line.length-1);
				otherEndBit++;
			  }
			  if(line.startsWith("#ARTIST \"")) {
  			  	info[1] = line.substring("#ARTIST \"".length, line.length-1);
				otherEndBit++;
			  }
			  if(line.startsWith("#WAVE \"")) {
  			  	info[2] = line.substring("#WAVE \"".length, line.length-1);
				//payload2.forEach(elementTmp => {
				for(var m = 0; m < payload2.length; m++) {
		  			var elementTmp = payload2[m];
					if(elementTmp.name == info[2]) {
						info[2] = elementTmp.download_url;
						otherEndBit++;
						break;
					}
				}
			  }
			  if(line.startsWith("#WAVEOFFSET "))
  			  	info[3] = parseFloat(line.substring("#WAVEOFFSET ".length, line.length));
			  if(line.startsWith("#JACKET \"")) {
  			  	info[4] = line.substring("#JACKET \"".length, line.length-1);
				//payload2.forEach(elementTmp => {
				for(var m = 0; m < payload2.length; m++) {
		  			var elementTmp = payload2[m];
					if(elementTmp.name == info[4])
						info[4] = elementTmp.download_url;
				}
			  }
			  if(line.startsWith("#TITLECARD \"")) {
  			  	info[5] = line.substring("#TITLECARD \"".length, line.length-1);
				//payload2.forEach(elementTmp => {
				for(var m = 0; m < payload2.length; m++) {
		  			var elementTmp = payload2[m];
					if(elementTmp.name == info[5])
						info[5] = elementTmp.download_url;
				}
			  }
			  if(line.startsWith("#ARTISTCARD \"")) {
  			  	info[6] = line.substring("#ARTISTCARD \"".length, line.length-1);
				//payload2.forEach(elementTmp => {
				for(var m = 0; m < payload2.length; m++) {
		  			var elementTmp = payload2[m];
					if(elementTmp.name == info[6])
						info[6] = elementTmp.download_url;
				}
			  }
			  if(line.startsWith("#COLORFORE ")) {
  			  	var temp = line.substring("#COLORFORE ".length, line.length);
				var hexTime = hexToRgb(temp);
				info[7] = hexTime[0] / 255.0;
				info[8] = hexTime[1] / 255.0;
				info[9] = hexTime[2] / 255.0;
			  }
			  if(line.startsWith("#COLORBACK ")) {
			  	var temp = line.substring("#COLORBACK ".length, line.length);
				var hexTime = hexToRgb(temp);
				info[10] = hexTime[0] / 255.0;
				info[11] = hexTime[1] / 255.0;
				info[12] = hexTime[2] / 255.0;
			  }
			  if(line.startsWith("#COLORACCENT ")) {
      		  	var temp = line.substring("#COLORACCENT ".length, line.length);
				var hexTime = hexToRgb(temp);
				info[13] = hexTime[0] / 255.0;
				info[14] = hexTime[1] / 255.0;
				info[15] = hexTime[2] / 255.0;
			  }
			  if(line.startsWith("#CHART 0"))
	    	  	endBit = endBit + 100;
			  if(line.startsWith("#CHART 1"))
  	    	  	endBit = endBit + 10;
			  if(line.startsWith("#CHART 2"))
  	    	  	endBit = endBit + 1;
		  }
        }
      }
	  if(endBit>=100)
		info[16] = "1";
	  else
	    info[16] = "0";
	  if(endBit%100>=10)
	    info[16] = info[16] + "1";
	  else
	    info[16] = info[16] + "0";
	  if(endBit%10>=1)
	    info[16] = info[16] + "1";
	  else
	    info[16] = info[16] + "0";
	  if(otherEndBit!=3||endBit==0) {
		//output = output + "\nNOPE\n" + info[0] + "\n" + info[1] + "\n" + info[2] + "\n" + otherEndBit + "\n" + endBit;
		continue;
	  }
	  info.forEach(out => {
		  if(output == "")
            output = out;
          else
            output = output + "\n" + out;
	  });
	  //now to grab chart links
	  //payload2.forEach(elementTmp => {
	  for(var j = 0; j < payload2.length; j++) {
		  var elementTmp = payload2[j];
		  if(elementTmp.name == "0.ssf" && info[16]>=100)
			output = output + "\n" + elementTmp.download_url;
		  if(elementTmp.name == "1.ssf" && info[16]%100>=10)
			output = output + "\n" + elementTmp.download_url;
		  if(elementTmp.name == "2.ssf" && info[16]%10>=1)
			output = output + "\n" + elementTmp.download_url;
	  }
	  otherOtherEndBit++;
    }//dir if end
  }//forloop end
  return otherOtherEndBit+"\n"+output;
}
