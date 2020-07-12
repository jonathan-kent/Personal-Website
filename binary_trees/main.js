
class Node{

  constructor(parent){
    this.left = null;
    this.right = null;
    this.parent = parent;
  }

  get signature(){
    var signature = "";
    if (this.left == null){
      signature = "0";
    } else{
      signature = "1";
    }
    if (this.right == null){
      signature = signature + "0";
    } else{
      signature = signature + "1";
    }
    return signature;
  }

}


class BinaryTree{

  constructor(){
    this.root = null;
  }

  add(newNode, side){
    if (this.root == null){
      this.root = newNode;
    } else if (side == "left"){
      newNode.parent.left = newNode;
    } else{
      newNode.parent.right = newNode;
    }
  }

  get height(){
    return getHeight(this.root, 0);
  }

}


function preOrder(node, signature){
  if (node == null){
    return signature;
  }
  signature = signature + node.signature;
  signature = preOrder(node.left, signature);
  signature = preOrder(node.right, signature);
  return signature;
}


function getHeight(node, height){
  if (node == null){
    return height;
  }
  height++;
  lHeight = getHeight(node.left, height);
  rHeight = getHeight(node.right, height);
  return Math.max(lHeight, rHeight);
}


function treeFromSignature(signature, parent, tree, dir){
  if (signature.length % 2 == 1){
    console.log("invalid tree signature: bad length");
    alert("Invalid Tree Signature");
    return null;
  }
  if (signature.charAt(signature.length-2) != '0' && signature.charAt(signature.length-1) != '0'){
    console.log("invalid tree signature: bad ending");
    alert("Invalid Tree Signature");
    return null;
  }
  if (signature.length == 0){
    var values = [tree, signature];
    return values;
  }

  var nodeSig = signature.substring(0,2);
  signature = signature.substring(2,signature.length);
  var node = new Node(parent);
  tree.add(node, dir);

  if (nodeSig.charAt(0) == "1"){
    //go left
    var returned = treeFromSignature(signature, node, tree, "left");
    signature = returned[1];
  }
  if (nodeSig.charAt(1) == "1"){
    //go right
    var returned = treeFromSignature(signature, node, tree, "right");
    signature = returned[1];
  }
  var values = [tree, signature];
  return values;
}


function renderTree(node, topOffset, leftOffset, parentOffset, depth){
  if (node == null){
    return;
  }
  var width = document.getElementById("tree").clientWidth;
  if(leftOffset == null){
    leftOffset = width / 2;
  } else{
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", leftOffset);
    line.setAttribute("y1", topOffset);
    line.setAttribute("x2", parentOffset);
    line.setAttribute("y2", topOffset-50);
    document.getElementById("svg").appendChild(line);
  }
  var renderNode = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  renderNode.setAttribute("cx", leftOffset);
  renderNode.setAttribute("cy", topOffset);
  renderNode.addEventListener("click", function(){clickHandler(renderNode, node)});
  document.getElementById("svg").appendChild(renderNode);
  depth++;
  renderTree(node.left, topOffset+50, leftOffset - (width/Math.pow(2, depth)), leftOffset, depth);
  renderTree(node.right, topOffset+50, leftOffset + (width/Math.pow(2, depth)), leftOffset, depth);
  return;
}

function fromForm(){
  var signature = document.getElementById("signature").value;
  var isDecimal = document.getElementById("decimal").checked;
  if (isDecimal){
    if (parseInt(signature) % 2 == 1){
      alert("Invalid Tree Signature");
      return;
    }
    signature = decToBin(signature);
    console.log(signature);
    //signature = (parseInt(signature) >>> 0).toString(2);
    if (signature.length % 2 == 1){
      signature = "0" + signature;
    }
  }
  newTree = treeFromSignature(signature, new Node(null), new BinaryTree(), null);
  if (newTree[0] != null){
    document.getElementById("svg").innerHTML = "";
    renderTree(newTree[0].root, 30, null, null, 1);
    globalTree = newTree[0];
    var signature = preOrder(globalTree.root, "");
    var display = document.getElementById("signatureDisplay");
    display.innerHTML = "Current Binary Signature: "+signature+"\
                        <br>Current Decimal Signature: "+ parseInt(signature, 2);
  }
}


function decToBin(decimal){
  decimal = parseInt(decimal);
  var binary = "";
  while(decimal > 0){
    binary = (decimal % 2) + binary;
    decimal = Math.floor(decimal / 2);
  }
  return binary;
}


function clickHandler(renderNode, node){
  if (renderNode.getAttribute("stroke") == null || renderNode.getAttribute("stroke") == "black"){
    document.getElementById("buttons").innerHTML = "";
    var elems = document.getElementsByTagName("circle");
    for (var i=0; i<elems.length; i++){
      elems[i].setAttribute("stroke", "black");
      elems[i].setAttribute("stroke-width", 0);
    }
    renderNode.setAttribute("stroke", "red");
    renderNode.setAttribute("stroke-width", 3);
  } else{
    document.getElementById("buttons").innerHTML = "";
    renderNode.setAttribute("stroke", "black");
    renderNode.setAttribute("stroke-width", 0);
    return;
  }

  var nodeX = renderNode.getAttribute("cx");
  var nodeY = renderNode.getAttribute("cy");
  var lButton = document.createElement("button");
  lButton.setAttribute("id", "leftChild");
  lButton.innerHTML = "Add Left Child";
  lButton.style.left = parseInt(nodeX) - 85;
  lButton.style.top = parseInt(nodeY) + 65;
  lButton.addEventListener("click", function(){addLeft(node)});
  var rButton = document.createElement("button");
  rButton.setAttribute("id", "rightChild");
  rButton.innerHTML = "Add Right Child";
  rButton.style.left = parseInt(nodeX) + 15;
  rButton.style.top = parseInt(nodeY) + 65;
  rButton.addEventListener("click", function(){addRight(node)});
  var buttons = document.getElementById("buttons");
  buttons.appendChild(lButton);
  buttons.appendChild(rButton);
}


function addLeft(node){
  globalTree.add(new Node(node), "left");
  document.getElementById("svg").innerHTML = "";
  document.getElementById("buttons").innerHTML = "";
  var signature = preOrder(globalTree.root, "");
  var display = document.getElementById("signatureDisplay");
  display.innerHTML = "Current Binary Signature: "+signature+"\
                      <br>Current Decimal Signature: "+ parseInt(signature, 2);
  renderTree(globalTree.root, 30, null, null, 1);
}


function addRight(node){
  globalTree.add(new Node(node), "right");
  document.getElementById("svg").innerHTML = "";
  document.getElementById("buttons").innerHTML = "";
  var signature = preOrder(globalTree.root, "");
  var display = document.getElementById("signatureDisplay");
  display.innerHTML = "Current Binary Signature: "+signature+"\
                      <br>Current Decimal Signature: "+ parseInt(signature, 2);
  renderTree(globalTree.root, 30, null, null, 1);
}

var globalTree = new BinaryTree();
var root = new Node(null);
globalTree.add(root, null);
var signature = preOrder(globalTree.root, "");
var display = document.getElementById("signatureDisplay");
display.innerHTML = "Current Binary Signature: "+signature+"\
                    <br>Current Decimal Signature: "+ parseInt(signature, 2);
renderTree(globalTree.root, 30, null, null, 1);
