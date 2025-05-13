let gotas = [];
let solo;
let tipoSolo = "vegetacao"; // valor inicial
let objetos = []; // Array para armazenar árvores, morros, prédios, etc.
let entidadesAereas = []; // Para helicópteros e aviões
let animaisVegetacao = []; // Para animais na vegetação
let pantanoExposto = null; // Para o pântano na área exposta
let nuvens = []; // Para nuvens
let anguloHelice = 0; // Ângulo para a rotação da hélice

function setup() {
  let canvas = createCanvas(900, 900);
  canvas.parent("canvas-holder");
  atualizarSolo(tipoSolo);
  // Inicializar um número maior de nuvens
  for (let i = 0; i < 8; i++) { // Aumentei para 8 nuvens iniciais
    nuvens.push(new Nuvem(random(width), random(50, 150), random(40, 90))); // Ajustei um pouco o tamanho
  }
}

function draw() {
  background(200, 220, 255); // céu

  // Mostrar nuvens (agora sempre)
  for (let nuvem of nuvens) {
    nuvem.mostrar();
    nuvem.mover();
  }

  for (let i = gotas.length - 1; i >= 0; i--) {
    gotas[i].cair();
    gotas[i].mostrar();

    if (gotas[i].atingeSolo(solo.altura)) {
      solo.aumentarErosao();
      gotas.splice(i, 1);
      // Ajustar a posição dos objetos quando o solo erode
      for (let obj of objetos) {
        if (obj && obj.y !== undefined) {
          obj.y += solo.taxaErosao;
        }
      }
      if (pantanoExposto) {
        pantanoExposto.y += solo.taxaErosao;
      }
      for (let animal of animaisVegetacao) {
        if (animal && animal.y !== undefined) {
          animal.y += solo.taxaErosao;
        }
      }
    }
  }

  solo.mostrar();

  // Mostrar objetos (árvores, morros, prédios)
  for (let obj of objetos) {
    if (obj) {
      obj.mostrar();
    }
  }

  // Mostrar entidades aéreas
  for (let entidade of entidadesAereas) {
    entidade.mostrar();
    entidade.mover();
  }

  // Mostrar animais na vegetação
  for (let animal of animaisVegetacao) {
    animal.mostrar();
    animal.mover();
  }

  // Mostrar pântano
  if (pantanoExposto) {
    pantanoExposto.mostrar();
  }

  if (frameCount % 5 === 0) {
    gotas.push(new Gota());
  }

  anguloHelice += 0.1; // Aumenta o ângulo para girar a hélice
}

function setSoilType(tipo) {
  tipoSolo = tipo;
  atualizarSolo(tipoSolo);
}

function atualizarSolo(tipo) {
  solo = new Solo(tipo);
  objetos = [];
  entidadesAereas = [];
  animaisVegetacao = [];
  pantanoExposto = null;

  if (tipo === "vegetacao") {
    // Adicionar árvores
    for (let i = 0; i < 10; i++) {
      let x = random(width);
      let yBaseArvore = solo.altura;
      objetos.push(new Arvore(x, yBaseArvore));
    }
    // Adicionar alguns animais
    for (let i = 0; i < 3; i++) {
      animaisVegetacao.push(new Animal(random(width * 0.2, width * 0.8), solo.altura));
    }
  } else if (tipo === "exposto") {
    // Adicionar morros
    objetos.push(new Morro(width * 0.2, solo.altura, 150, 50));
    objetos.push(new Morro(width * 0.7, solo.altura, 100, 30));
    // Adicionar pântano
    pantanoExposto = new Pantano(0, solo.altura + 20, width, 50);
  } else if (tipo === "urbanizado") {
    // Adicionar prédios
    objetos.push(new Predio(width * 0.3, solo.altura, 75, 225)); // Prédios maiores
    objetos.push(new Predio(width * 0.6, solo.altura, 105, 300)); // Prédios maiores
    // Adicionar helicóptero MAIOR e com hélice girando
    entidadesAereas.push(new Helicoptero(random(width * 0.2, width * 0.4), random(50, 150), 45, 15, 30, 0.7));
    // Adicionar avião MAIOR
    entidadesAereas.push(new Aviao(random(width * 0.6, width * 0.8), random(100, 200), 60, 15, 1.2));
  }
}

class Gota {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.vel = random(4, 6);
  }

  cair() {
    this.y += this.vel;
  }

  mostrar() {
    stroke(0, 0, 200);
    line(this.x, this.y, this.x, this.y + 10);
  }

  atingeSolo(ySolo) {
    return this.y > ySolo;
  }
}

class Solo {
  constructor(tipo) {
    this.tipo = tipo;
    this.altura = height - 350;
    this.erosao = 0;
    this.taxaErosao = 0;
  }

  aumentarErosao() {
    let taxa;
    if (this.tipo === "vegetacao") taxa = 0.1;
    else if (this.tipo === "exposto") taxa = 0.5;
    else if (this.tipo === "urbanizado") taxa = 0.3;
    else if (this.tipo === "mar") taxa = -0.1;

    this.taxaErosao = taxa;
    this.erosao += taxa;
    this.altura += taxa;
  }

  mostrar() {
    noStroke();
    let soloColor;
    if (this.tipo === "vegetacao") soloColor = color(0, 150, 60);
    else if (this.tipo === "exposto") soloColor = color(139, 69, 19);
    else if (this.tipo === "urbanizado") soloColor = color(120);
    else if (this.tipo === "mar") soloColor = color(0, 100, 200);

    fill(soloColor);
    rect(0, this.altura, width, height - this.altura);

    fill(0);
    textSize(14);
    textAlign(LEFT);
    text(`Erosão: ${this.erosao.toFixed(1)}`, 10, 20);
    text(`Tipo de solo: ${this.tipo}`, 10, 40);
  }
}

class Arvore {
  constructor(x, yBase) {
    this.x = x;
    this.yBase = yBase;
    this.larguraTronco = 10;
    this.alturaTronco = 30;
    this.raioCopa = 20;
    this.yTronco = this.yBase - this.alturaTronco;
    this.yCopa = this.yTronco - this.raioCopa;
  }

  mostrar() {
    // Tronco
    fill(139, 69, 19);
    rect(this.x - this.larguraTronco / 2, this.yTronco, this.larguraTronco, this.alturaTronco);
    // Copa
    fill(0, 100, 0);
    ellipse(this.x, this.yCopa, this.raioCopa * 2, this.raioCopa * 2);
  }

  set y(novoYBase) {
    this.yBase = novoYBase;
    this.yTronco = this.yBase - this.alturaTronco;
    this.yCopa = this.yTronco - this.raioCopa;
  }

  get y() {
    return this.yBase;
  }
}

class Morro {
  constructor(x, yBase, largura, altura) {
    this.x = x;
    this.yBase = yBase;
    this.largura = largura;
    this.altura = altura;
  }

  mostrar() {
    fill(101, 67, 33);
    triangle(this.x - this.largura / 2, this.yBase, this.x + this.largura / 2, this.yBase, this.x, this.yBase - this.altura);
  }

  set y(novoYBase) {
    this.yBase = novoYBase;
  }

  get y() {
    return this.yBase;
  }
}

class Predio {
  constructor(x, yBase, largura, altura) {
    this.x = x;
    this.yBase = yBase;
    this.largura = largura;
    this.altura = altura;
    this.cor = color(100 + random(155), 100 + random(155), 100 + random(155));
    this.yPredio = this.yBase - this.altura;
  }

  mostrar() {
    fill(this.cor);
    rect(this.x - this.largura / 2, this.yPredio, this.largura, this.altura);
    // Adicionar algumas janelas simples
    fill(200);
    let espacamentoX = this.largura / 4;
    let espacamentoY = this.altura / 5;
    let larguraJanela = espacamentoX / 2;
    let alturaJanela = espacamentoY / 2;
    for (let i = 1; i < 4; i += 1.5) {
      for (let j = 1; j < 5; j += 1.5) {
        rect(this.x - this.largura / 2 + i * espacamentoX - larguraJanela / 2, this.yPredio + j * espacamentoY - alturaJanela / 2, larguraJanela, alturaJanela);
      }
    }
  }

  set y(novoYBase) {
    this.yBase = novoYBase;
    this.yPredio = this.yBase - this.altura;
  }

  get y() {
    return this.yBase;
  }
}

class Helicoptero {
  constructor(x, y, tamanhoCorpo = 425, alturaCorpo = 135, tamanhoRotor = 130, velocidadeX = 1.7) {
    this.x = x;
    this.y = y;
    this.tamanhoCorpo = tamanhoCorpo;
    this.alturaCorpo = alturaCorpo;
    this.tamanhoRotor = tamanhoRotor;
    this.velocidadeX = velocidadeX;
  }

  mostrar() {
    fill(150);
    // Corpo
    rect(this.x - this.tamanhoCorpo / 2, this.y - this.alturaCorpo / 2, this.tamanhoCorpo, this.alturaCorpo);
    // Rotor girando
    push();
    translate(this.x, this.y);
    rotate(anguloHelice);
    stroke(0);
    line(-this.tamanhoRotor / 2, 0, this.tamanhoRotor / 2, 0);
    line(0, -this.tamanhoRotor / 2, 0, this.tamanhoRotor / 2);
    noStroke();
    pop();
  }

  mover() {
    this.x += this.velocidadeX;
    if (this.x > width + this.tamanhoCorpo / 2) {
      this.x = -this.tamanhoCorpo / 2;
    }
  }
}

class Aviao {
  constructor(x, y, comprimento = 60, alturaAsa = 15, velocidadeX = 1.2) {
    this.x = x;
    this.y = y;
    this.comprimento = comprimento;
    this.alturaAsa = alturaAsa;
    this.velocidadeX = velocidadeX;
  }

  mostrar() {
    fill(200);
    // Corpo
    rect(this.x, this.y, this.comprimento, 7);
    // Asas
    triangle(this.x + 15, this.y - this.alturaAsa / 2, this.x + 15, this.y + this.alturaAsa / 2, this.x - 7, this.y);
    triangle(this.x + this.comprimento - 15, this.y - this.alturaAsa / 2, this.x + this.comprimento - 15, this.y + this.alturaAsa / 2, this.x + this.comprimento + 7, this.y);
  }

  mover() {
    this.x += this.velocidadeX;
    if (this.x > width + this.comprimento) {
      this.x = -this.comprimento;
    }
  }
}

class Animal {
  constructor(x, yBase) {
    this.x = x;
    this.yBase = yBase;
    this.tamanho = 15;
    this.velocidadeX = random(-0.5, 0.5);
  }

  mostrar() {
    fill(100, 50, 0);
    ellipse(this.x, this.yBase - this.tamanho / 2, this.tamanho, this.tamanho);
  }

  mover() {
    this.x += this.velocidadeX;
    if (this.x > width + this.tamanho / 2 || this.x < -this.tamanho / 2) {
      this.velocidadeX *= -1;
    }
  }

  set y(novoYBase) {
    this.yBase = novoYBase;
  }

  get y() {
    return this.yBase;
  }
}

class Pantano {
  constructor(x, y, largura, altura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;
    this.corPantano = color(50, 50, 0, 150);
  }

  mostrar() {
    fill(this.corPantano);
    rect(this.x, this.y, this.largura, this.altura);
  }

  set y(novoY) {
    this.y = novoY;
  }

  get y() {
    return this.y;
  }
}

class Nuvem {
  constructor(x, y, largura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = largura * 0.6;
    this.velocidadeX = 0.1;
  }

  mostrar() {
    noStroke();
    fill(255, 255, 255, 200);
    ellipse(this.x, this.y, this.largura, this.altura);
    ellipse(this.x + this.largura / 2, this.y + this.altura / 4, this.largura * 0.8, this.altura * 0.8);
    ellipse(this.x - this.largura / 3, this.y + this.altura / 3, this.largura * 0.7, this.altura * 0.7);
  }

  mover() {
    this.x += this.velocidadeX;
    if (this.x > width + this.largura) {
      this.x = -this.largura;
    }
  }
}
