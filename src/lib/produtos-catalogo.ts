/**
<<<<<<< HEAD
 * Catálogo único da loja
 */

import type { StaticImageData } from 'next/image'

import iphone16pro from '@/assets/produtos/apple-iphone-16-pro-tres-cores.jpeg'
import iphone15 from '@/assets/produtos/apple-iphone-15-series-5-cores.jpeg'
import samsungGalaxy from '@/assets/produtos/samsunggalaxy.jpeg'
import smartphoneandroid from '@/assets/produtos/smartphone-android.jpeg'
import notebookhp from '@/assets/produtos/notebookhp.jpeg'
import computadorPortatil from '@/assets/produtos/computador-portatil.jpeg'
import ramNotebook from '@/assets/produtos/memóriaramparanotebook.jpeg'
import ssd from '@/assets/produtos/ssd-wd-blue-500gb-sata-3d-nand.jpeg'
import ssd500 from '@/assets/produtos/ssd500.jpeg'
import colunajbl from '@/assets/produtos/colunajbl.jpeg'
import jblcharge from '@/assets/produtos/jblcharge5.jpeg'
import colunasdesom from '@/assets/produtos/colunasdesom.jpeg'
import tecladonumerico from '@/assets/produtos/tecladonumerico.jpeg'
import pilhamaxell from '@/assets/produtos/pilhamaxell.jpeg'
import tpLinkOc200 from '@/assets/produtos/tplink-oc200.jpeg'
import caboRede from '@/assets/produtos/caboderede.jpeg'
import adaptadorVgaHdmi from '@/assets/produtos/adaptador-vga-hdmi.jpeg'
import monitorgamer from '@/assets/produtos/monitor-gamer-curvo.jpeg'
import smarttv from '@/assets/produtos/smarttv.jpeg'
import smarttvbox from '@/assets/produtos/smarttvbox.jpeg'
import impressorahp from '@/assets/produtos/impressora-multifuncional.jpeg'
import impressoraTermica from '@/assets/produtos/impressora-termica.jpeg'
import gavetadinheiro from '@/assets/produtos/gaveta-dinheiro-bematech.jpeg'
import router4g from '@/assets/produtos/router4g.jpeg'
import amplificadorSinal from '@/assets/produtos/amplificadordesinalpararedes.jpeg'
import tpLinkPoeSwitch from '@/assets/produtos/TP-LINK PoE Switch.jpeg'
import tpLinkOmada from '@/assets/produtos/tplink-omada.jpeg'
import caboCat6 from '@/assets/produtos/caboderede.jpeg'
import caboUSBTypeC from '@/assets/produtos/cabousbtipoc.jpeg'
import organizadorCabos from '@/assets/produtos/organizadordecabos.jpeg'
import abracadeirasnylon from '@/assets/produtos/abracadeira.jpeg'
import conectorRj45 from '@/assets/produtos/conectorrj45.jpeg'
import testadordecabo from '@/assets/produtos/testadordecabo.jpeg'
import kitTestador from '@/assets/produtos/kittestadordecabo.jpeg'
import alicate from '@/assets/produtos/alicate.jpeg'
import controleacesso from '@/assets/produtos/controledeacesso.jpeg'
import cameraDahua from '@/assets/produtos/camera-seguranca-dahua-bullet-hd.jpeg'
import relogioPonto from '@/assets/produtos/relogiodepontobiométrico.jpeg'
import pendrive32gb from '@/assets/produtos/pendrive.jpeg'
import microsd32gb from '@/assets/produtos/cartaodememoria32gb.jpeg'
import cdrhp from '@/assets/produtos/cdrvirgem.jpeg'
import gravadorDvd from '@/assets/produtos/gravador.jpeg'
import dockingStation from '@/assets/produtos/haysenser-hdd-docking-station-usb3-dupla.jpeg'
import dockingHdd from '@/assets/produtos/hayssenderHDD.jpeg'
import dellDocking from '@/assets/produtos/dell-docking-station-wd19-wd22-serie.jpeg'
import manhattanDock from '@/assets/produtos/manhattan.jpeg'
import headphones from '@/assets/produtos/headphones.jpeg'
import colunaJbl from '@/assets/produtos/coluna-jbl.jpeg'
import jblCharge from '@/assets/produtos/jblcharge.jpeg'
import colunasDeSom from '@/assets/produtos/colunasdesom.jpeg'
import tecladoNumerico from '@/assets/produtos/tecladonumerico.jpeg'
import mousehp from '@/assets/produtos/mousehp.jpeg'
import mousepad from '@/assets/produtos/mousepad.jpeg'
import tecladoMouse from '@/assets/produtos/teclado-mouse.jpeg'
import pilhaMaxell from '@/assets/produtos/pilha-maxell.jpeg'
import filtroLinha from '@/assets/produtos/filtrodelinha.jpeg'
import nobreak from '@/assets/produtos/rack-servidor-parede-armario-rede.jpeg'
import calculadoraexbom from '@/assets/produtos/calculadora-exbom.jpeg'
import espiraisrenz from '@/assets/produtos/espirais-encadernacao-renz-ring-wire.jpeg'
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
  name: 'Apple iPhone 16 Pro',
  description:
    'Smartphone premium da Apple com ecrã Super Retina XDR OLED de 6,3 polegadas, processador A18 Pro, sistema de câmaras Pro de 48 MP com ultra grande angular e teleobjetiva, gravação de vídeo 4K Dolby Vision, conectividade 5G, Wi-Fi 7, Face ID, USB-C, carregamento MagSafe e bateria de longa duração.',
  category: 'Smartphones e Telemóveis',
  image: iphone16pro,
},
{
  id: 'gavetadinheiro',
  name: 'Gaveta de dinheiro',
  description:
    'Gaveta metálica para caixas registadoras e sistemas POS, utilizada para armazenamento seguro de numerário.',
  category: 'Automação Comercial',
  image: gavetadinheiro,
},
{
  id: 'testadordecabo',
  name: 'Alicate Grimpar',
  description:
    'Ferramenta profissional para crimpagem de conectores RJ45 e RJ11 em instalações de redes.',
  category: 'Ferramentas de Rede',
  image: testadordecabo,
},
{
  id: 'controleacesso',
  name: 'Camera Dayhua',
  description:
    'Câmara de videovigilância para monitorização e segurança de residências e empresas.',
  category: 'Segurança Eletrónica',
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
  id: 'adaptadorhdmivga',
  name: 'HDMI Conversor VGA',
  description:
    'Conversor de sinal HDMI para VGA compatível com monitores, televisores e projetores.',
  category: 'Adaptadores e Conversores',
  image: adaptadorVgaHdmi,
},
  {
  id: 'calculadoraexbom',
  name: 'Telefone Analogico (IPPRO )',
  description:
    'Telefone analógico para utilização em escritórios, empresas e centrais telefónicas.',
  category: 'Produtos',
  image: calculadoraexbom,
},
{
  id: 'abracadeirasnylon',
  name: 'Orga.cabos (EWENT)',
  description:
    'Organizador de cabos para manter instalações organizadas e protegidas.',
  category: 'Organização e Instalação',
  image: abracadeirasnylon,
},
{
  id: 'smartphoneandroid',
  name: 'Auricular sem fio Redmi',
  description:
    'Auriculares Bluetooth Redmi com excelente qualidade de som e autonomia.',
  category: 'Áudio',
  image: smartphoneandroid,
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
  name: 'Cartão de Memoria 32GB',
  description:
    'Cartão de memória de 32GB para smartphones, câmaras e outros dispositivos.',
  category: 'Armazenamento',
  image: microsd32gb,
},
{
  id: 'espiraisrenz',
  name: 'Resma de Papel',
  description:
    'Resma de papel A4 de alta qualidade para impressão e fotocópias.',
  category: 'Material de Escritório',
  image: espiraisrenz,
},
{
  id: 'pendrive32gb',
  name: 'Pendrive(Maxell)',
  description:
    'Pen drive Maxell para armazenamento e transporte de ficheiros.',
  category: 'Armazenamento',
  image: pendrive32gb,
},
{
  id: 'relogioponto',
  name: 'Camera smarth',
  description:
    'Câmara inteligente para monitorização remota de residências e empresas.',
  category: 'Segurança Eletrónica',
  image: relogioPonto,
},
{
  id: 'amplificadorsinal',
  name: 'TP-LINK AC1200',
  description:
    'Router TP-Link AC1200 Dual Band para redes Wi-Fi de alto desempenho.',
  category: 'Redes e Internet',
  image: amplificadorSinal,
},
{
  id: 'cabo-typec',
  name: 'Cabo de carregar 3 em 1',
  description:
    'Cabo multifuncional compatível com USB-C, Micro USB e Lightning.',
  category: 'Cabos e Conectividade',
  image: caboUSBTypeC,
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
  id: 'cdr-hp',
  name: 'DVD-R HP',
  description:
    'DVD-R HP para gravação e armazenamento seguro de ficheiros.',
  category: 'Armazenamento',
  image: cdrhp,
},
{
  id: 'filtro-linha',
  name: 'UPS Pulstar Line Interactive UPS',
  description:
    'UPS interativa para proteção contra falhas de energia e picos de tensão.',
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
  id: 'notebook-hp',
  name: 'Notebook HP',
  description:
    'Computador portátil HP indicado para trabalho, estudos e utilização profissional.',
  category: 'Computadores',
  image: notebookhp,
},
{
  id: 'iphone15',
  name: 'Apple iPhone 15',
  description:
    'Smartphone Apple com ecrã Super Retina XDR, chip A16 Bionic, câmara de 48 MP e ligação USB-C.',
  category: 'Smartphones e Telemóveis',
  image: iphone15,
},
{
  id: 'samsung-galaxy',
  name: 'Samsung Galaxy',
  description:
    'Smartphone Samsung Galaxy com excelente desempenho, câmaras avançadas e conectividade 5G.',
  category: 'Smartphones e Telemóveis',
  image: samsungGalaxy,
},
{
  id: 'smart-tv',
  name: 'Smart TV HQ',
  description:
    'Smart TV de alta definição com acesso a aplicações de streaming e conectividade Wi-Fi.',
  category: 'Televisores',
  image: smarttv,
},
{
  id: 'smart-tv-box',
  name: 'Smart TV Box MXQ Pro 4K',
  description:
    'TV Box Android para transformar qualquer televisão numa Smart TV.',
  category: 'Entretenimento',
  image: smarttvbox,
},
{
  id: 'ssd500',
  name: 'SSD WD Blue 500GB',
  description:
    'Disco SSD SATA de 500GB que proporciona maior velocidade ao computador.',
  category: 'Armazenamento',
  image: ssd500,
},
{
  id: 'coluna-jbl',
  name: 'Coluna JBL GO',
  description:
    'Coluna Bluetooth portátil JBL com excelente qualidade de som e bateria de longa duração.',
  category: 'Áudio',
  image: colunajbl,
},
{
  id: 'colunas-som',
  name: 'Colunas de Som',
  description:
    'Sistema de colunas estéreo para computadores e dispositivos multimédia.',
  category: 'Áudio',
  image: colunasdesom,
},
{
  id: 'teclado-numerico',
  name: 'Teclado Numérico Exbom',
  description:
    'Teclado numérico USB ideal para escritórios e utilização com portáteis.',
  category: 'Periféricos de Computador',
  image: tecladonumerico,
},
{
  id: 'pilha-maxell',
  name: 'Pilha Maxell 9V',
  description:
    'Pilha alcalina Maxell de 9V para equipamentos eletrónicos.',
  category: 'Energia',
  image: pilhamaxell,
},{
  id: 'tp-link-poe-switch',
  name: 'TP-Link PoE Switch',
  description:
    'Switch PoE TP-Link para alimentação e ligação de câmaras IP, telefones VoIP e outros dispositivos de rede.',
  category: 'Redes e Internet',
  image: tpLinkPoeSwitch,
},
{
  id: 'tp-link-omada',
  name: 'TP-Link Omada Controller',
  description:
    'Controlador centralizado TP-Link Omada para gestão profissional de redes empresariais.',
  category: 'Redes e Internet',
  image: tpLinkOmada,
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
  id: 'camera-seguranca-dahua-bullet-hd',
  name: 'Câmara de Segurança Dahua',
  description:
    'Câmara IP Dahua para videovigilância em residências, empresas e estabelecimentos comerciais.',
  category: 'Segurança Eletrónica',
  image: cameraDahua,
},
{
  id: 'gravador-dvd',
  name: 'Gravador DVD Externo Slim USB',
  description:
    'Gravador e leitor externo de DVD/CD com ligação USB para computadores portáteis e desktops.',
  category: 'Armazenamento',
  image: gravadorDvd,
},
{
  id: 'docking-station',
  name: 'Docking Station USB 3.0',
  description:
    'Base de expansão USB 3.0 para ligação de múltiplos periféricos a computadores portáteis.',
  category: 'Acessórios de Computador',
  image: dockingStation,
},
{
  id: 'docking-hdd',
  name: 'Docking Station para HDD/SSD',
  description:
    'Dock para discos SATA HDD e SSD, permitindo leitura, clonagem e transferência de dados.',
  category: 'Armazenamento',
  image: dockingHdd,
},
{
  id: 'impressora-termica',
  name: 'Impressora Térmica Portátil',
  description:
    'Impressora térmica portátil para emissão de recibos, faturas e talões.',
  category: 'Impressoras e Consumíveis',
  image: impressoraTermica,
},
{
  id: 'rack-servidor',
  name: 'Rack de Servidor para Parede',
  description:
    'Armário metálico para organização e proteção de equipamentos de rede e servidores.',
  category: 'Infraestrutura de Redes',
  image: rackServidor,
},

{
  id: 'alicate-crimpagem',
  name: 'Alicate de Crimpagem',
  description:
    'Ferramenta profissional para crimpagem de conectores RJ45, RJ11 e RJ12.',
  category: 'Ferramentas de Rede',
  image: alicate,
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
  id: 'iphone15-series',
  name: 'Apple iPhone 15',
  description:
    'Smartphone Apple equipado com chip A16 Bionic, ecrã Super Retina XDR OLED e câmara principal de 48 MP.',
  category: 'Smartphones e Telemóveis',
  image: iphone15,
},
{
  id: 'notebook-hp',
  name: 'Notebook HP',
  description:
    'Computador portátil HP de elevado desempenho, ideal para trabalho, estudos e utilização profissional.',
  category: 'Computadores',
  image: notebookhp,
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
  id: 'samsung-galaxy',
  name: 'Samsung Galaxy',
  description:
    'Smartphone Samsung Galaxy com ecrã de alta definição, excelente desempenho e câmaras de alta resolução.',
  category: 'Smartphones e Telemóveis',
  image: samsungGalaxy,
},
{
  id: 'smart-tv',
  name: 'Smart TV HQ',
  description:
    'Smart TV Full HD/4K com acesso a aplicações de streaming, Wi-Fi integrado e excelente qualidade de imagem.',
  category: 'Televisores',
  image: smarttv,
},
{
  id: 'smart-tv-box',
  name: 'Smart TV Box MXQ Pro 4K',
  description:
    'TV Box Android que transforma qualquer televisão numa Smart TV com suporte para conteúdos em 4K.',
  category: 'Entretenimento',
  image: smarttvbox,
},
{
  id: 'ssd-wd-blue',
  name: 'SSD WD Blue 500GB',
  description:
    'Disco SSD SATA de 500GB que aumenta significativamente a velocidade de arranque e desempenho do computador.',
  category: 'Armazenamento',
  image: ssd,
},
{
  id: 'dell-docking',
  name: 'Dell Docking Station',
  description:
    'Docking Station Dell para expansão de portas USB, HDMI, DisplayPort e ligação de múltiplos monitores.',
  category: 'Acessórios de Computador',
  image: dellDocking,
},
{
  id: 'coluna-jbl-go',
  name: 'JBL GO 2/3',
  description:
    'Coluna Bluetooth portátil JBL com som potente, bateria de longa duração e resistência à água.',
  category: 'Áudio',
  image: colunaJbl,
},
{
  id: 'jbl-charge',
  name: 'JBL Charge 5',
  description:
    'Coluna Bluetooth premium com graves potentes, autonomia prolongada e certificação IP67.',
  category: 'Áudio',
  image: jblCharge,
},
{
  id: 'colunas-som',
  name: 'Colunas de Som',
  description:
    'Sistema de colunas estéreo para computadores, notebooks e equipamentos multimédia.',
  category: 'Áudio',
  image: colunasDeSom,
},
{
  id: 'teclado-numerico',
  name: 'Teclado Numérico Exbom',
  description:
    'Teclado numérico USB para facilitar operações contabilísticas e introdução de dados.',
  category: 'Periféricos de Computador',
  image: tecladoNumerico,
},
{
  id: 'rato',
  name: 'Rato Wireless',
  description:
    'Rato para utilização profissional e doméstica.',
  category: 'Periféricos de Computador',
  image: mousehp,
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
{
  id: 'organizador-cabos',
  name: 'Organizador de Cabos',
  description:
    'Acessório para organização de cabos elétricos e de rede, proporcionando instalações mais limpas e seguras.',
  category: 'Organização e Instalação',
  image: organizadorCabos,
},
{
  id: 'manhattan-dock',
  name: 'Manhattan Docking Station',
  description:
    'Docking Station Manhattan com múltiplas portas USB, HDMI e Ethernet para expansão de conectividade.',
  category: 'Acessórios de Computador',
  image: manhattanDock,
},
{
  id: 'kit-testador',
  name: 'Kit Testador de Cabos',
  description:
    'Kit profissional para teste e diagnóstico de cabos RJ45, RJ11 e cablagem estruturada.',
  category: 'Ferramentas de Rede',
  image: kitTestador,
}

]