let table; // Oggetto p5.Table contenente il dataset
const itemSize = 65; // Dimensione del fungo
const padding = 50; // Spazio tra le celle della griglia
const outerPadding = 40; // Margine dai bordi della finestra
const topOffset = 40; // Spazio verticale in alto prima della griglia

function preload() {
}

function setup() {
  angleMode(DEGREES); 
  console.log('p5.js version:', p5.VERSION); 

  if (!table) { // Dataset simulato
    table = new p5.Table(); // Crea una nuova tabella 
    table.addColumn("sizeVal"); // Colonna per la dimensione del fungo
    table.addColumn("tiltVal"); // Colonna per l'inclinazione del fusto
    table.addColumn("colorVal"); // Colonna per il colore del cappello
    table.addColumn("widthRatio"); // Colonna per la larghezza del cappello

    for (let i = 0; i < 204; i++) { // Genera numero di funghi
      let r = table.addRow(); // Aggiunge una nuova riga alla tabella
      r.setNum("sizeVal", random(25, 65)); // Assegna una taglia casuale tra 25 e 65 px
      r.setNum("tiltVal", random(-18, 18)); // Assegna un'inclinazione casuale tra -18° e +18°
      r.setNum("colorVal", random(0, 100)); // Assegna un valore colore casuale tra 0 e 100
      r.setNum("widthRatio", random(0.6, 1.6)); // Gamma ampliata per variare maggiormente la forma
    }
  }

  let cols = floor((windowWidth - 2 * outerPadding) / (itemSize + padding)); // Calcola il numero di colonne per riga
  let rows = ceil(table.getRowCount() / cols); // Calcola il numero totale di righe necessarie
  let totalHeight = topOffset + rows * (itemSize + padding) + outerPadding; // Calcola l'altezza complessiva 

  // Crea il canvas direttamente con l'altezza totale per abilitare lo scroll nativo della finestra
  createCanvas(windowWidth, max(windowHeight, totalHeight)); 

  noLoop(); // Disattiva il loop continuo
}

function drawMushroomGlyph(mSize, mColor, capRatio) {
  push(); // Isola le trasformazioni e gli stili del glifo
  rectMode(CENTER); // Imposta l'ancoraggio dei rettangoli sul loro centro
  noStroke(); // Rimuove il contorno dalle forme geometriche

  let stemW = mSize * 0.22; // Larghezza del gambo proporzionale alla dimensione
  let stemH = mSize * 0.6; // Altezza del gambo proporzionale alla dimensione
  let capW = mSize * capRatio; // Larghezza del cappello modulata dal dato
  // L'altezza varia in modo inverso/dinamico rispetto alla larghezza per creare forme a cupola, a campana o piatte
  let capH = mSize * (0.55 / capRatio); 

  fill(235, 228, 210); // Colore del gambo
  rect(0, stemH * 0.2, stemW, stemH, stemW * 0.3); // Gambo con spigoli arrotondati

  fill(215, 206, 186); // Colore per l'anello
  rect(0, stemH * 0.05, stemW * 1.3, mSize * 0.06, 2); 

  fill(60, 45, 35, 45); // Colore per l'ombra
  arc(0, 0, capW * 0.9, capH * 0.35, 0, 180); 

  fill(mColor); // Applica la tinta parametrizzata dai dati
  arc(0, 0, capW, capH * 2, 180, 360, CHORD); 

  fill(255, 255, 255, 230); // Bianco per i pallini
  let dot = mSize * 0.08; // Diametro dei pallini
  circle(0, -capH * 0.55, dot * 1.1); // Puntino centrale 
  circle(-capW * 0.23, -capH * 0.32, dot * 0.85); // Puntino intermedio sx
  circle(capW * 0.23, -capH * 0.32, dot * 0.85); // Puntino intermedio dx
  circle(-capW * 0.35, -capH * 0.12, dot * 0.6); // Puntino inferiore sx
  circle(capW * 0.35, -capH * 0.12, dot * 0.6); // Puntino inferiore dx

  pop(); 
}

function drawGrid() {
  let cols = floor((width - 2 * outerPadding) / (itemSize + padding)); 
  let colCount = 0; 
  let rowCount = 0; 

  let cLow = color(235, 175, 40); // Colore giallo ocra per valori bassi
  let cMid = color(190, 55, 45); // Colore terracotta per valori intermedi
  let cHigh = color(110, 45, 80); // Colore violaceo per valori alti

  for (let i = 0; i < table.getRowCount(); i++) { 
    let row = table.getRow(i).obj; 

    let s = Number(row["sizeVal"]); // Converte in numero la dimensione
    let angle = Number(row["tiltVal"]); // Converte in numero l'inclinazione
    let cNorm = map(Number(row["colorVal"]), 0, 100, 0, 1); // Normalizza il valore colore da 0 a 1
    let ratio = Number(row["widthRatio"]); // Converte in numero il rapporto larghezza

    let capCol; // Variabile per il colore finale mescolato
    if (cNorm < 0.5) { // Se il valore è nella prima metà
      capCol = lerpColor(cLow, cMid, cNorm * 2); // Sfuma tra giallo ocra e terracotta
    } else { // Se il valore è nella seconda metà
      capCol = lerpColor(cMid, cHigh, (cNorm - 0.5) * 2); // Sfuma tra terracotta e violaceo
    }

    let x = outerPadding + colCount * (itemSize + padding) + itemSize / 2; 
    let y = topOffset + rowCount * (itemSize + padding) + itemSize / 2; 

    push(); 
    translate(x, y); 
    rotate(angle); 
    drawMushroomGlyph(s, capCol, ratio); 
    pop(); 

    colCount++; // Passa alla colonna successiva
    if (colCount >= cols) { 
      colCount = 0; 
      rowCount++; // Passa alla riga successiva verso il basso
    }
  }
}

function draw() {
  background(156, 175, 136); // Sfondo
  drawGrid(); // Disegna tutti i glifi distribuiti nella griglia
}

function windowResized() {
  let cols = floor((windowWidth - 2 * outerPadding) / (itemSize + padding));
  let rows = ceil(table.getRowCount() / cols);
  let totalHeight = topOffset + rows * (itemSize + padding) + outerPadding;
  resizeCanvas(windowWidth, max(windowHeight, totalHeight));
  redraw(); // Riesegue una volta il disegno per ricalcolare la griglia
}