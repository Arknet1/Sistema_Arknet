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
import pendrive32gb from '@/assets/produtos/pendrive.jpeg`
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
      'Smartphone premium da Apple com ecrã Super Retina XDR OLED, processador A18 Pro, sistema de câmaras Pro de alta resolução, gravação de vídeo 4K Dolby Vision, conectividade 5G, Wi-Fi 7, Face ID, USB-C e carregamento MagSafe.',
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
      'Repetidor Wi-Fi desenvolvido para ampliar a cobertura da rede sem fios, reduzir zonas sem sinal e melhorar a ligação em residências e escritórios.',
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
      'Distribui um sinal HDMI para até quatro ecrãs simultaneamente mantendo qualidade de imagem e som em alta definição.',
    category: 'Áudio e Vídeo',
    image: hdtv,
  },

  {
    id: 'colunas-manhattan',
    name: 'Colunas Manhattan',
    description:
      'Colunas compactas com boa qualidade sonora para computadores, portáteis e dispositivos multimédia.',
    category: 'Áudio e Multimédia',
    image: colunas,
  },

  {
    id: 'alicate',
    name: 'Alicate de Crimpar RJ45',
    description:
      'Ferramenta profissional para corte, decapagem e crimpagem de conectores RJ45 utilizada em instalações de rede.',
    category: 'Ferramentas de Rede',
    image: alicategrimpar,
  },
