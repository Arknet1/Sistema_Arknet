/**
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
  name: 'Apple iPhone 16 Pro 256 GB',
  description:
    'Smartphone premium da Apple com ecrã Super Retina XDR OLED de 6,3 polegadas, processador A18 Pro, sistema de câmaras Pro de 48 MP, gravação de vídeo 4K Dolby Vision, conectividade 5G, Wi-Fi 7, Face ID, USB-C e carregamento MagSafe.',
  category: 'Smartphones e Telemóveis',
  image: iphone16pro,
},

{
  id: 'Adaptadorwifi',
  name: 'Adaptador Wi-Fi Alfa',
  description:
    'Adaptador Wi-Fi USB Alfa de alto desempenho, ideal para melhorar a receção e transmissão de sinal sem fios em computadores e portáteis.',
  category: 'Redes',
  image: Adaptadorwifi,
},

{
  id: 'repetidordesinal',
  name: 'Repetidor de Sinal Wi-Fi com 2 Antenas Externas',
  description:
    'Repetidor de sinal Wi-Fi desenvolvido para ampliar a cobertura da rede sem fios, reduzir zonas sem sinal e melhorar a ligação em residências e escritórios.',
  category: 'Redes',
  image: repetidor,
},

{
  id: 'universalnotebook',
  name: 'Universal Notebook Power Adaptador 8 conectores',
  description:
    'Adaptador universal de energia para computadores portáteis com 8 conectores diferentes. Compatível com vários modelos de notebooks.',
  category: 'Acessórios de Computador',
  image: universalnotebook,
},

{
  id: 'extensao-ups-ewent',
  name: 'Extensão UPS Ewent',
  description:
    'Extensão UPS Ewent com proteção contra sobrecargas e picos de tensão, ideal para proteger computadores, monitores e equipamentos de rede.',
  category: 'Energia e Proteção',
  image: extensao,
},

{
  id: 'hdtv-splitter-ver1x4',
  name: 'HDTV Splitter Ver 1x4',
  description:
    'HDTV Splitter permite distribuir um sinal HDMI para até quatro ecrãs mantendo qualidade de imagem e som em alta definição.',
  category: 'Áudio e Vídeo',
  image: hdtv,
},

{
  id: 'colunas-manhattan',
  name: 'Colunas Manhattan',
  description:
    'Colunas compactas com som de qualidade para computadores, portáteis e equipamentos multimédia.',
  category: 'Áudio e Multimédia',
  image: colunas,
},

{
  id: 'alicate',
  name: 'Alicate de Crimpar RJ45',
  description:
    'Ferramenta profissional para corte, decapagem e crimpagem de conectores RJ45 em instalações de rede.',
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
  name: 'Testador Finder de Cabo UTP',
  description:
    'Ferramenta para teste de cabos de rede UTP, permitindo identificar falhas em ligações Ethernet.',
  category: 'Ferramentas de Rede',
  image: testadordecabo,
},

{
  id: 'controleacesso',
  name: 'Mini Teclado Controlo de Acesso TV',
  description:
    'Mini teclado compacto para controlo de acesso e navegação em sistemas TV, computadores e dispositivos multimédia.',
  category: 'Acessórios',
  image: controleacesso,
},

{
  id: 'monitorgamer',
  name: 'Monitor Wintech 27 Polegadas',
  description:
    'Monitor Wintech de 27 polegadas com excelente qualidade de imagem para trabalho, jogos e entretenimento.',
  category: 'Monitores',
  image: monitorgamer,
},

{
  id: 'mouse',
  name: 'Rato sem fio HP Preto',
  description:
    'Rato sem fio HP com conexão wireless 2.4 GHz, design ergonómico e alta precisão para computadores e portáteis.',
  category: 'Periféricos',
  image: mouse,
},

{
  id: 'adaptadorhdmivga',
  name: 'Adaptador de Vídeo VGA para HDMI',
  description:
    'Conversor de sinal VGA para HDMI compatível com monitores, televisores e projetores.',
  category: 'Adaptadores e Conversores',
  image: adaptadorVgaHdmi,
},

{
  id: 'abracadeirasnylon',
  name: 'Conector de Rede Intellinet RJ45 Cat6 100 unidades',
  description:
    'Conector RJ45 Cat6 UTP com contatos banhados a ouro, ideal para montagem de cabos Ethernet de alta performance.',
  category: 'Organização e Instalação',
  image: abracadeirasnylon,
},

{
  id: 'impressorahp',
  name: 'Impressora HP DeskJet',
  description:
    'Impressora HP DeskJet para impressão, digitalização e cópia de documentos.',
  category: 'Impressoras e Consumíveis',
  image: impressorahp,
},

{
  id: 'microsd32gb',
  name: 'Cartão de Memória Micro SD 32GB Kingston',
  description:
    'Cartão de memória de 32GB para smartphones, câmaras e outros dispositivos.',
  category: 'Armazenamento',
  image: microsd32gb,
},

{
  id: 'pendrive32gb',
  name: 'Pen Drive Maxell 32GB USB 2.0',
  description:
    'Pen drive Maxell para armazenamento e transporte de ficheiros.',
  category: 'Armazenamento',
  image: pendrive32gb,
},

{
  id: 'relogioponto',
  name: 'Relógio Biométrico ZKTeco K20',
  description:
    'Relógio biométrico ZKTeco K20 para controlo de assiduidade, com ligação LAN, USB e armazenamento de registos.',
  category: 'Segurança Eletrónica',
  image: relogioPonto,
},

{
  id: 'roteador',
  name: 'Roteador Industrial Teltonika RUTM',
  description:
    'Roteador industrial Teltonika desenvolvido para aplicações IoT e automação industrial, oferecendo conectividade segura, VPN, Dual SIM e gestão remota.',
  category: 'Redes',
  image: Roteadorindustrial,
},

{
  id: 'router4g',
  name: 'TP-Link 300Mbps Wireless N Router',
  description:
    'Router TP-Link Wireless N de 300 Mbps para redes domésticas e empresariais.',
  category: 'Redes e Internet',
  image: router4g,
},

{
  id: 'headphones',
  name: 'Auriculares com fio AEG',
  description:
    'Auriculares com fio para computadores, smartphones e outros dispositivos multimédia.',
  category: 'Áudio',
  image: headphones,
},

{
  id: 'ram-so-dimm',
  name: 'Memória RAM DDR4 8GB 3200MHz Para Portátil',
  description:
    'Memória RAM DDR4 de 8GB para portáteis, proporcionando maior desempenho e velocidade.',
  category: 'Acessórios de Computador',
  image: ramNotebook,
},

{
  id: 'filtro-linha',
  name: 'Extensão UPS Ewent',
  description:
    'Extensão elétrica Ewent com múltiplas tomadas para proteção e ligação segura de equipamentos eletrónicos.',
  category: 'Energia e Proteção',
  image: filtroLinha,
},

{
  id: 'mousepad',
  name: 'Base de Rato Ewent',
  description:
    'Base para rato que proporciona maior conforto e precisão durante a utilização.',
  category: 'Periféricos de Computador',
  image: mousepad,
},

{
  id: 'mouse-hp',
  name: 'Teclado + Rato Genius',
  description:
    'Kit Genius composto por teclado e rato USB para uso profissional e doméstico.',
  category: 'Periféricos de Computador',
  image: tecladoMouse,
},

{
  id: 'tp-link-poe-switch',
  name: 'Router Wi-Fi TP-Link 300 Mbps com 2 Antenas',
  description:
    'Router Wi-Fi TP-Link com velocidade até 300 Mbps, duas antenas externas, porta WAN e portas LAN para ligação estável à Internet.',
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
  /* Continuação produtosCatalogo */

{
  id: 'cabo-cat6',
  name: 'Cabo de Rede CAT6',
  description:
    'Cabo Ethernet CAT6 de alta velocidade para instalações de redes locais, garantindo melhor desempenho e estabilidade na transmissão de dados.',
  category: 'Cabos e Conectividade',
  image: caboRede,
},

{
  id: 'rack-servidor',
  name: 'Bastidor de Rede Intellinet 09U (ALP-485x600x450) 19 com Porta de Vidro',
  description:
    'Bastidor de rede Intellinet 09U de 19 polegadas com estrutura metálica resistente e porta frontal em vidro, ideal para organização e proteção de equipamentos de rede.',
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
    'Computador portátil para produtividade, navegação na internet e utilização em ambientes empresariais.',
  category: 'Computadores',
  image: computadorPortatil,
},

{
  id: 'impressora-termica',
  name: 'Impressora Térmica X-Printer',
  description:
    'Impressora térmica X-Printer ideal para emissão de recibos, talões e documentos em sistemas POS e comércio.',
  category: 'Impressoras e Automação Comercial',
  image: impressoraTermica,
},

{
  id: 'pilha-maxell',
  name: 'Pilha Maxell 9V',
  description:
    'Pilha alcalina Maxell de 9V indicada para equipamentos eletrónicos, alarmes e dispositivos de segurança.',
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
