/**
<<<<<<< HEAD
 * Catálogo único da loja
 */

import type { StaticImageData } from 'next/image'

import iphone16pro from '@/assets/produtos/apple-iphone-16-pro-tres-cores.jpeg'
import Adaptadorwifi from '@/assets/produtos/Adaptadorwi-fiAlfa.jpeg'
import Roteadorindustrial from '@/assets/produtos/Roteador-Industrial.jpeg'
import mouse from '@/assets/produtos/mouse.jpeg'
import smartphoneandroid from '@/assets/produtos/smartphone-android.jpeg'
import computadorPortatil from '@/assets/produtos/computador-portatil.jpeg'
import ramNotebook from '@/assets/produtos/memóriaramparanotebook.jpeg'
import tpLinkOc200 from '@/assets/produtos/tplink-oc200.jpeg'
import repetidor from '@/assets/produtos/repetidordesinal.jpeg'
import testadordecabo from '@/assets/produtos/testadordecabo.jpeg'
import caboRede from '@/assets/produtos/caboderede.jpeg'
import extensao from '@/assets/produtos/extensão.jpeg'
import hdtv from '@/assets/produtos/hdtv.jpeg'
import colunas from '@/assets/produtos/colunam.jpeg'
import adaptadorVgaHdmi from '@/assets/produtos/adaptador-vga-hdmi.jpeg'
import alicategrimpar from '@/assets/produtos/alicate-grimpar.jpeg'
import monitorgamer from '@/assets/produtos/monitor-gamer-curvo.jpeg'
import impressorahp from '@/assets/produtos/impressora-multifuncional.jpeg'
import impressoraTermica from '@/assets/produtos/impressoratermica.jpeg'
import gavetaposbematech from '@/assets/produtos/gaveta-dinheiro-bematech.jpeg'
import router4g from '@/assets/produtos/router4g.jpeg'
import universalnotebook from '@/assets/produtos/universal-notebook.jpeg'
import tpLinkPoeSwitch from '@/assets/produtos/TP-LINK PoE Switch.jpeg'
import caboCat6 from '@/assets/produtos/caboderede.jpeg'
import abracadeirasnylon from '@/assets/produtos/abracadeira.jpeg'
import conectorRj45 from '@/assets/produtos/conectorrj45.jpeg'
import controleacesso from '@/assets/produtos/controledeacesso.jpeg'
import relogioPonto from '@/assets/produtos/relogiodepontobiométrico.jpeg'
import pendrive32gb from '@/assets/produtos/pendrive.jpeg'
import microsd32gb from '@/assets/produtos/cartaodememoria32gb.jpeg'
import headphones from '@/assets/produtos/headphones.jpeg'
import mousepad from '@/assets/produtos/mousepad.jpeg'
import tecladoMouse from '@/assets/produtos/teclado-mouse.jpeg'
import pilhaMaxell from '@/assets/produtos/pilha-maxell.jpeg'
import filtroLinha from '@/assets/produtos/filtrodelinha.jpeg'

import rackServidor from '@/assets/produtos/rack-servidor-parede-armario-rede.jpeg'


export type ProdutoDestaqueDef = {
  id: string
  name: string
  description: string
  category: string
  image: StaticImageData
}


export const produtosCatalogo: ProdutoDestaqueDef[] = [

  {
    id: 'iphone16pro',
    name: 'Apple iPhone 17 Pro Max 256 GB',
    description:
      'Smartphone premium da Apple com ecrã Super Retina XDR OLED de 6,3 polegadas, processador A18 Pro, sistema de câmaras Pro de 48 MP com ultra grande angular e teleobjetiva, gravação de vídeo 4K Dolby Vision, conectividade 5G, Wi-Fi 7, Face ID, USB-C, carregamento MagSafe e bateria de longa duração.',
    category: 'Smartphones e Telemóveis',
    image: iphone16pro,
  },
  {
    id: 'Adaptadorwifi',
    name: 'Adaptador Wi-Fi Alfa',
    description:
      'Adaptador Wi-Fi USB Alfa de alto desempenho, ideal para melhorar a receção e transmissão de sinal sem fios em computadores e portáteis. Compatível com redes IEEE 802.11 e de fácil instalação.',
    category: 'Redes',
    image: Adaptadorwifi,
  },
  {
    id: 'repetidordesinal',
    name: 'Repetidor de Sinal Wi-Fi com 2 Antenas Externas',
    description:
      'Repetidor de sinal Wi-Fi com duas antenas externas, desenvolvido para ampliar a cobertura da rede sem fios e eliminar áreas de baixa receção. Compatível com os padrões IEEE 802.11 b/g/n, oferece instalação simples, modo repetidor e ponto de acesso, sendo ideal para residências e escritórios.',
    category: 'Redes',
    image: repetidor,
  },

  {
    id: 'universalnotebook',
    name: 'Universal Notebook Power Adaptador 8 conectores',
    description:
      'Repetidor de sinal Wi-Fi com duas antenas externas, desenvolvido para ampliar a cobertura da rede sem fios e eliminar áreas de baixa receção. Compatível com os padrões IEEE 802.11 b/g/n, oferece instalação simples, modo repetidor e ponto de acesso, sendo ideal para residências e escritórios.',
    category: 'Redes',
    image: universalnotebook,
  },

{
  id: 'extensao-ups-ewent',
  name: 'Extensão UPS Ewent',
  description:
    'Extensão UPS Ewent com proteção contra sobrecargas e picos de tensão, ideal para proteger equipamentos eletrónicos como computadores, monitores e dispositivos de rede. Oferece maior segurança e estabilidade no fornecimento de energia.',
  category: 'Energia e Proteção',
  image: extensao,
},

{
  id: 'hdtv-splitter-ver1x4',
  name: 'HDTV Splitter Ver 1x4',
  description:
    'HDTV Splitter 1x4 permite distribuir um sinal HDMI para até quatro ecrãs simultaneamente, mantendo a qualidade de imagem e som em alta definição. Ideal para sistemas de apresentação, lojas, salas de reuniões e entretenimento.',
  category: 'Áudio e Vídeo',
  image: hdtv,
},

{
  id: 'colunas-manhattan',
  name: 'Colunas Manhattan',
  description:
    'Colunas Manhattan com som de qualidade e design compacto, ideais para computadores, portáteis e dispositivos multimédia. Proporcionam áudio claro para música, vídeos, chamadas e entretenimento.',
  category: 'Áudio e Multimédia',
  image: colunas,
},
{
  id: 'alicate',
  name: 'Alicate de Crimpar RJ45',
  description:
    'Alicate profissional para crimpar conectores RJ45 em cabos de rede Ethernet. Ideal para montagem e manutenção de cabos de rede, compatível com conectores RJ45 Cat5e e Cat6, oferecendo corte, decapagem e crimpagem precisa.',
  category: 'Ferramentas de Rede',
  image: alicategrimpar,
},


  {
    id: 'gavetaposbematech',
    name: 'Gaveta POS Bematech',
    description:
      'Gaveta metálica para caixas registadoras e sistemas POS, utilizada para armazenamento seguro de numerário.',
    category: 'Automação Comercial',
    image: gavetaposbematech,
  },
  {
    id: 'testadordecabo',
    name: 'Testador Finder de cabo UTP',
    description:
      'Ferramenta profissional para crimpagem de conectores RJ45 e RJ11 em instalações de redes.',
    category: 'Ferramentas de Rede',
    image: testadordecabo,
  },
  {
    id: 'controleacesso',
    name: 'Mini Teclado Controlo de Acesso TV',
    description:
      'Mini teclado compacto para controlo de acesso e navegação em sistemas TV, computadores e dispositivos multimédia. Possui teclas de fácil utilização, design portátil e conexão prática para maior comodidade no controlo de equipamentos.',
    category: 'Acessórios',
    image: controleacesso,
  },
  {
    id: 'monitorgamer',
    name: 'Monitores wintech 27',
    description:
      'Monitor Wintech de 27 polegadas com excelente qualidade de imagem para trabalho e entretenimento.',
    category: 'Monitores',
    image: monitorgamer,
  },
  {
    id: 'mouse',
    name: 'Rato sem fio HP preto',
    description:
      'Rato sem fio HP na cor preta, com conexão wireless de 2,4 GHz, design ergonómico, alta precisão e ideal para uso em computadores e portáteis.',
    category: 'Periféricos',
    image: mouse,
  },
  {
    id: 'adaptadorhdmivga',
    name: 'Adaptador de vido VGA para HDMI',
    description:
      'Conversor de sinal HDMI para VGA compatível com monitores, televisores e projetores.',
    category: 'Adaptadores e Conversores',
    image: adaptadorVgaHdmi,
  },

  {
    id: 'abracadeirasnylon',
    name: 'Conector de Rede Intellinet, RJ45 cat 6 100un',
    description:
      "Conector de rede RJ45 Cat6 UTP com contatos banhados a ouro, compatível com cabos de 24 a 26 AWG. Embalagem com 100 unidades, ideal para crimpagem de cabos Ethernet em redes de alta performance.",
    category: 'Organização e Instalação',
    image: abracadeirasnylon,
  },
  {
    id: 'impressorahp',
    name: 'IMPRESSORA HP (DESKJET)',
    description:
      'Impressora HP DeskJet para impressão, digitalização e cópia de documentos.',
    category: 'Impressoras e Consumíveis',
    image: impressorahp,
  },
  {
    id: 'microsd32gb',
    name: 'Cartão de memória Micro SD 32 GB kingston canvas select Plus+ Adaptador /class 10',
    description:
      'Cartão de memória de 32GB para smartphones, câmaras e outros dispositivos.',
    category: 'Armazenamento',
    image: microsd32gb,
  },

  {
    id: 'pendrive32gb',
    name: 'Pen drive (Maxell) 32 GB venture USB 2.0',
    description:
      'Pen drive Maxell para armazenamento e transporte de ficheiros.',
    category: 'Armazenamento',
    image: pendrive32gb,
  },
  {
    id: 'relogioponto',
    name: 'Relogio Biometrico ZKTeco K20 1xLAN, 1xUSB, 1500 Registro c/ Bateria',
    description:
      'Câmara inteligente para monitorização remota de residências e empresas.',
    category: 'Segurança Eletrónica',
    image: relogioPonto,
  },
  {
    id: 'roteador',
    name: 'Roteador Industrial Teltonika RUTM',
    description:
      'Roteador industrial Teltonika RUTM desenvolvido para aplicações IoT e automação industrial, oferecendo conectividade de alta velocidade, suporte a redes 4G/5G (conforme o modelo), portas Gigabit Ethernet, Wi-Fi, VPN, Dual SIM e recursos avançados de gestão remota para garantir comunicação estável e segura em ambientes críticos.',
    category: 'Redes',
    image: Roteadorindustrial,
  },

  {
    id: 'router4g',
    name: 'TP-LINK 300mbps wirellss N router',
    description:
      'Router TP-Link Wireless N de 300 Mbps para redes domésticas e empresariais.',
    category: 'Redes e Internet',
    image: router4g,
  },
  {
    id: 'headphones',
    name: 'Auriculares com fio (AEG)',
    description:
      'Auriculares com fio para computadores, smartphones e outros dispositivos multimédia.',
    category: 'Áudio',
    image: headphones,
  },
  {
    id: 'ram-so-dimm',
    name: 'Memoria RAM DDR4 8Gb 3200A Para Portàtil',
    description:
      'Memória RAM DDR4 de 8GB para portáteis, proporcionando maior desempenho.',
    category: 'Acessórios de Computador',
    image: ramNotebook,
  },
 
  {
    id: 'filtro-linha',
    name: 'Extensão UPS Ewent',
    description:
      'Extensão elétrica Ewent com múltiplas tomadas, ideal para ligar computadores, impressoras, monitores e outros equipamentos eletrónicos com segurança e praticidade.',
    category: 'Energia e Proteção',
    image: filtroLinha,
  },
  {
    id: 'mousepad',
    name: 'Base de Mause (EWENT)',
    description:
      'Base para rato que proporciona maior conforto e precisão durante a utilização.',
    category: 'Periféricos de Computador',
    image: mousepad,
  },
  {
    id: 'mouse-hp',
    name: 'Teclado+ Rato GENIUS',
    description:
      'Kit Genius composto por teclado e rato USB para uso profissional e doméstico.',
    category: 'Periféricos de Computador',
    image: tecladoMouse,
  },


 
 

  {
    id: 'tp-link-poe-switch',
    name: 'Router Wi-Fi TP-Link 300 Mbps com 2 Antenas, 1 Porta WAN e 4 Portas LAN',
    description:
      'Router Wi-Fi TP-Link com velocidade de até 300 Mbps, equipado com duas antenas externas para maior cobertura, uma porta WAN 10/100 Mbps e quatro portas LAN 10/100 Mbps. Ideal para residências e pequenos escritórios, oferecendo ligação estável e segura à Internet.',
    category: 'Redes e Internet',
    image: tpLinkPoeSwitch,
  },

  {
    id: 'tp-link-oc200',
    name: 'TP-Link Omada Hardware Controller OC200',
    description:
      'Controlador físico OC200 para gestão centralizada de equipamentos TP-Link Omada.',
    category: 'Redes e Internet',
    image: tpLinkOc200,
  },
  {
    id: 'cabo-cat6',
    name: 'Cabo de Rede CAT6',
    description:
      'Cabo Ethernet CAT6 de alta velocidade para instalações de redes locais.',
    category: 'Cabos e Conectividade',
    image: caboRede,
  },
 


 {
  id: 'rack-servidor',
  name: 'Bastidor de Rede Intellinet 09U (ALP-485x600x450) 19 com Porta de Vidro',
  description:
    'Bastidor de rede Intellinet 09U de 19 polegadas, com estrutura metálica resistente e porta frontal em vidro, ideal para organização, proteção e instalação de equipamentos de rede, como switches, patch panels, routers e outros dispositivos de infraestrutura.',
  category: 'Infraestrutura de Redes',
  image: rackServidor,
},

  
  {
    id: 'conector-rj45',
    name: 'Conector RJ45',
    description:
      'Conector RJ45 Cat5e/Cat6 para montagem de cabos de rede Ethernet.',
    category: 'Cabos e Conectividade',
    image: conectorRj45,
  },
  
  {
    id: 'computador-portatil',
    name: 'Computador Portátil',
    description:
      'Computador portátil para produtividade, navegação na internet e aplicações empresariais.',
    category: 'Computadores',
    image: computadorPortatil,
  },

 
  
  {
    id: 'impressora-termica',
    name: ' Impressora térmica X-Printer ',
    description:
      'Computador portátil para produtividade, navegação na internet e aplicações empresariais.',
    category: 'Computadores',
    image: impressoraTermica,
  },


  {
    id: 'pilha-maxell',
    name: 'Pilha Maxell 9V',
    description:
      'Pilha alcalina Maxell de 9V indicada para equipamentos eletrónicos e dispositivos de segurança.',
    category: 'Energia',
    image: pilhaMaxell,
  },
  {
    id: 'cabo-cat6-soho',
    name: 'Cabo de Rede CAT6 Soho Plus',
    description:
      'Bobina de cabo CAT6 para instalações profissionais de redes Ethernet de alta velocidade.',
    category: 'Cabos e Conectividade',
    image: caboCat6,
  },
]
