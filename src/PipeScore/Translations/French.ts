//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY, without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

import type { Documentation, TextItems } from '.';

export const FrenchDocumentation: Documentation = {
  home: 'Retourner à la page des partitions.',
  help: "Voir la page d'aide.",
  save: 'Sauvegarder la partition. PipeScore enregistre automatiquement la partition toutes les minutes.',
  sb: 'Cliquez sur ce bouton pour saisir des notes de type ronde. Vous pouvez également sélectionner une note déjà présente sur la partition et appuyer sur ce bouton pour la transformer en ronde.',
  m: 'Cliquez sur ce bouton pour saisir des notes de type blanche. Vous pouvez également sélectionner une note déjà présente sur la partition et appuyer sur ce bouton pour la transformer en blanche.',
  c: 'Cliquez sur ce bouton pour saisir des notes de type noir. Vous pouvez également sélectionner une note déjà présente sur la partition et appuyer sur ce bouton pour la transformer en noir.',
  q: 'Cliquez sur ce bouton pour saisir des notes de type croche. Vous pouvez également sélectionner une note déjà présente sur la partition et appuyer sur ce bouton pour la transformer en croche.',
  sq: 'Cliquez sur ce bouton pour saisir des notes de type double croche. Vous pouvez également sélectionner une note déjà présente sur la partition et appuyer sur ce bouton pour la transformer en double croche.',
  ssq: 'Cliquez sur ce bouton pour saisir des notes de type triple croche. Vous pouvez également sélectionner une note déjà présente sur la partition et appuyer sur ce bouton pour la transformer en triple croche.',
  hdsq: 'Cliquez sur ce bouton pour saisir des notes de type quadruple croche. Vous pouvez également sélectionner une note déjà présente sur la partition et appuyer sur ce bouton pour la transformer en quadruple croche.',
  dot: "Ajoute un point à la note sélectionnée ou à la longueur de la note que vous êtes en train de saisir. S'il y a déjà un point, il sera supprimé.",
  tie: 'Lier la note sélectionnée à la note qui la précède.',
  'second-timing':
    'Ajouter une 1er/2e reprise. Sélectionnez le début de la première reprise et appuyez sur ce bouton, puis faites glisser pour modifier la position.',
  'single-timing':
    "Ajouter une 2ème reprise. Sélectionnez le début de l'emplacement de la reprise et appuyez sur cette touche, puis faites glisser pour modifier la position.",
  'edit-second-timing': 'Modifier le texte de la reprise.',
  triplet: 'Transformer les trois notes sélectionnées en triolet.',
  natural:
    "Ajouter/supprimer la tonalité naturelle (bécarre) de la note. Ceci ne s'applique qu'aux notes C et F.",
  delete:
    "Supprimer la note, la note d'ornementation, le texte ou la mesure actuellement sélectionnés. Pour les notes d'ornementation, cliquez sur la ligature pour sélectionner l'ensemble ou cliquez sur la tête pour ne sélectionner qu'une seule note. Pour supprimer une portée, supprimer toutes les mesures qu'elle contient.",
  copy: 'Copier les notes (ou les mesures) actuellement sélectionnées. Pour sélectionner plusieurs notes, cliquez sur la première note à sélectionner, puis maintenez la touche Shift enfoncée et cliquez sur la dernière note à sélectionner.',
  paste: 'Coller les notes que vous avez copiées.',
  undo: 'Annuler la dernière action qui a modifié la partition.',
  redo: 'Refaire la dernière action que vous avez annulée.',
  single:
    "Ajoute une note unique d'ornementation à la note sélectionnée. Vous pouvez également appuyer sur ce bouton, puis utiliser la souris pour placer la note gracieuse à l'endroit voulu sur la partition.",
  doubling:
    'Ajouter une doublée à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une doublée.',
  'half-doubling':
    'Ajouter une demi-doublée à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une demi-doublée.',
  'throw-d':
    'Ajouter une lancée sur ré à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une lancée sur ré.',
  grip: 'Ajouter une prise à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une prise.',
  birl: 'Ajouter une fillette à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une fillette.',
  'g-gracenote-birl':
    'Ajouter une fillette de do à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une fillette de si.',
  'g-strike':
    'Ajouter une choquée à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une choquée.',
  shake:
    'Ajouter une secouée à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une secouée.',
  'c-shake':
    'Ajouter une secouée aiguë à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une secouée aiguë.',
  taorluath:
    'Ajouter une avancée à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une avancée.',
  crunluath:
    'Ajouter une rattrapée à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une rattrapée.',
  edre: 'Ajouter une entre-note à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une entre-note.',
  bubbly:
    'Ajouter une pétillante à la note sélectionnée. Vous pouvez également cliquer sur ce bouton puis sur toutes les notes auxquelles vous souhaitez ajouter une pétillante.',
  'add-bar-before': 'Ajouter une nouvelle mesure avant la barre sélectionnée.',
  'add-bar-after': 'Ajouter une nouvelle mesure après la mesure sélectionnée.',
  'edit-bar-time-signature':
    "Modifier l'indication de mesure. Si l'indication de mesure est affichée au début de la mesure, vous pouvez également la modifier en cliquant dessus.",
  'reset-bar-length':
    'Réinitialiser la longueur de la mesure à une taille automatique. Si vous avez modifié la longueur de la mesure en faisant glisser les barres de mesure, cela se réinitialise sur la ou les mesures actuellement sélectionnées.',
  'normal-barline':
    'Définir la barre de la mesure actuellement sélectionnée comme la ligne simple de défaut.',
  'repeat-barline':
    'Définir la barre de la mesure actuellement sélectionnée comme une répétition.',
  'part-barline':
    'Définir la barre de la mesure actuellement sélectionnée comme un début/fin de partie (deux lignes épaisses).',
  'add-lead-in-before':
    'Ajouter une nouvelle entrée (anacrouse) avant la mesure actuellement sélectionnée.',
  'add-lead-in-after':
    'Ajouter une nouvelle entrée (mesure de fin) après la mesure actuellement sélectionnée.',
  'add-stave-before':
    "Ajouter une nouvelle portée vide sur la ligne précédant la portée sélectionnée. Sélectionner une portée en choisissant n'importe quelle note ou mesure de cette portée.",
  'add-stave-after':
    "Ajouter une nouvelle portée vide sur la ligne suivant la portée sélectionnée. Sélectionner une portée en choisissant n'importe quelle note ou mesure de cette portée.",
  'delete-stave':
    "Supprime la portée actuellement sélectionnée. Sélectionner une portée en choisissant n'importe quelle note ou mesure de cette portée.",
  'add-harmony':
    'Add a harmony stave after the currently selected stave. Select a stave by selecting any note or bar in that stave.',
  'add-harmony-to-all':
    'Add a harmony stave to all staves in the selected tune. Select a tune by selecting any note or bar in that tune.',
  'remove-harmony':
    'Delete the last harmony stave on selected stave(s). Select a stave by selecting any note or bar in that stave.',
  'set-stave-gap': "Ajuster l'intervalle par défaut entre toutes les portées.",
  'reset-stave-gap':
    "Réinitialiser la valeur par défaut de l'intervalle entre les portées.",
  'add-tune-before':
    "Ajouter un nouveau morceau avant le morceau sélectionné. Sélectionner n'importe quelle note ou mesure de ce morceau.",
  'add-tune-after':
    "Ajouter un nouveau morceau à la suite du morceau sélectionné. Sélectionner n'importe quelle note ou mesure de ce morceau.",
  'set-tune-gap':
    "Ajuster la marge avant du morceau actuellement sélectionné. Sélectionner un morceau en choisissant n'importe quelle note ou mesure de ce morceau.",
  'reset-tune-gap':
    "Réinitialiser la marge avant du morceau actuellement sélectionnée. Sélectionner un morceau en choisissant n'importe quelle note ou mesure de ce morceau.",
  'delete-tune':
    "Supprimer le morceau actuellement sélectionné. Sélectionner un morceau en choisissant n'importe quelle note ou mesure de ce morceau.",
  'add-text': 'Ajouter une nouvelle zone de texte.',
  'centre-text': 'Centrage horizontal de la zone de texte sélectionnée.',
  'edit-text': 'Modifier la zone de texte sélectionnée.',
  'set-text-coords':
    'Définit les coordonnées de la zone de texte. Cette fonction peut être utilisée pour un contrôle précis. La plupart du temps, il suffit de faire glisser la zone de texte. Positionne la zone de texte à X% de la gauche et à Y% du haut de la page.',
  play: "Jouer un aperçu de la partition depuis le début. Cela ne fonctionnera qu'une fois les échantillons téléchargés (si les échantillons doivent être téléchargés, vous verrez un avis).",
  'play-from-selection':
    "Jouer un aperçu de la partition à partir de la note/mesure sélectionnée. Cela ne fonctionnera qu'une fois les échantillons téléchargés (si les échantillons doivent être téléchargés, vous verrez un avis).",
  'play-looping-selection':
    'Jouer la partie de la partition actuellement sélectionnée, en jouant en boucle.',
  stop: 'Arrêter la lecture.',
  'playback-speed':
    "Contrôler la vitesse de lecture (plus c'est à droite, plus c'est rapide).",
  'harmony-volume': 'Control how loud the harmony plays (further right is louder).',
  export:
    'Exporter la partition vers un fichier PDF, qui peut ensuite être partagé ou imprimé.',
  'export-bww':
    "Exporter la partition vers un fichier BWW, qui peut être ouvert dans d'autres applications. Cette fonction est actuellement très récente et ne fonctionnera pas pour la plupart des partitions.",
  download:
    "Télécharger la partition sous la forme d'un fichier .pipescore. Cela vous permet de sauvegarder vos partitions sur votre ordinateur et de les télécharger à nouveau sur un autre compte. Le fichier téléchargé ne peut être ouvert que dans PipeScore.",
  landscape: 'Mettre la/les page(s) en paysage.',
  portrait: 'Mettre la (les) page(s) en portrait.',
  'page-numbers':
    "Afficher les numéros de page au bas de chaque page, s'il y a plus d'une page.",
  'disable-help': "Contrôler l'affichage du volet d'aide en bas à droite.",
  zoom: "Zoom: permet de contrôler la taille de la partition sur l'écran. Faites glisser le curseur vers la droite pour effectuer un zoom avant, vers la gauche pour effectuer un zoom arrière.",
  'number-of-pages': 'Ajouter ou supprimer des pages.',
  'move-bar-to-previous-line':
    "Déplacez la mesure sélectionnée à la fin de la portée précédente. Ceci ne s'applique que si vous êtes en train de sélectionner la première mesure d'une portée.",
  'move-bar-to-next-line':
    "Déplacer la mesure sélectionnée au début de la portée suivante. Ceci ne s'applique que si vous êtes en train de sélectionner la dernière mesure d'une portée.",
  'nothing-hovered': "Survolez les différentes icônes pour afficher l'aide ici.",
};

export const FrenchTextItems: TextItems = {
  homeMenu: 'Accueil',
  noteMenu: 'Note',
  gracenoteMenu: 'Gracenote',
  barMenu: 'Mesure',
  secondTimingMenu: 'Reprises et Saut',
  staveMenu: 'Portée',
  tuneMenu: 'Morceau',
  textMenu: 'Texte',
  playbackMenu: 'Lecteur',
  documentMenu: 'Document',
  settingsMenu: 'Paramètres',
  helpMenu: 'Aide',
  addNote: 'Ajouter Note',
  modifyNote: 'Modifier Note',
  addGracenote: 'Ajouter Gracenote',
  addBar: 'Ajouter Mesure',
  addBarBefore: 'Ajouter Mesure Avant',
  addBarAfter: 'Ajouter Mesure Après',
  addLeadIn: 'Ajouter Lead-in',
  addLeadInBefore: 'Ajouter Lead-in Avant',
  addLeadInAfter: 'Ajouter Lead-in Après',
  modifyBar: 'Modifier Mesure',
  editTimeSignature: 'Éditer Indication de Mesure',
  resetBarLength: 'Réinitialer Longueur de Mesure',
  start: 'Début',
  end: 'Fin',
  modifyBarlines: 'Modifier Barres de Mesure',
  normalBarline: 'Normal',
  repeatBarline: 'Répétition',
  partBarline: 'Début/Fin',
  moveBar: 'Déplacer Mesure',
  moveToPreviousStave: 'Déplacer vers Portée Précédente',
  moveToNextStave: 'Déplacer vers Portée Suivante',
  addTiming: 'Ajouter Reprise/Saut',
  addSecondTiming: '1st/2nd',
  addSingleTiming: '2nd',
  modifyTiming: 'Modifier Reprise/Saut',
  editTimingText: 'Éditer Texte Reprise/Saut',
  addStave: 'Ajouter Portée',
  before: 'Avant',
  after: 'Après',
  modifyStave: 'Modifier Portée',
  adjustStaveGap: "Modifier l'intervalle des portées",
  reset: 'Réinitialiser',
  deleteStave: 'Supprimer Portée',
  delete: 'Supprimer',
  harmonyStave: 'Add Harmony',
  addHarmony: 'Add harmony to selected staves',
  addHarmonyToAll: 'Add harmony to all staves',
  deleteHarmony: 'Delete Harmony',
  addTune: 'Ajouter Morceau',
  modifyTune: 'Modifier Morceau',
  adjustGapBeforeTune: 'Ajuster la marge avant le morceau',
  deleteTune: 'Supprimer Morceau',
  addTextBox: 'Ajouter Zone Texte',
  modifyTextBox: 'Modifier Zone Texte',
  centreText: 'Centrer Texte',
  editText: 'Éditer Texte',
  setTextBoxPosition: 'Position Zone Texte',
  x: 'X',
  y: 'Y',
  controls: 'Contrôles',
  playFromBeginning: 'Jouer du Début',
  playFromSelection: 'Jouer de la Sélection',
  playLoopedSelection: 'Jouer Sélection en Boucle',
  stop: 'Arrêter',
  playbackOptions: 'Playback Options',
  beatsPerMinute: 'battements par minute',
  harmonyVolume: 'harmony volume',
  orientation: 'Orientation',
  landscape: 'Paysage',
  portrait: 'Portrait',
  pageNumbers: 'Numéros Page',
  showPageNumbers: 'Montrer Numéros Page',
  export: 'Exporter',
  exportPDF: 'Exporter PDF',
  exportBWW: 'Exporter BWW',
  download: 'Charger fichier PipeScore',
  staveLayout: 'Disposition Portées',
  gapBetweenLines: 'Espace entre lignes',
  harmonyGap: 'Gap between harmony staves',
  gracenoteLayout: 'Disposition Gracenote',
  gapAfterGracenote: 'Espace Après Gracenote ',
  margins: 'Marges',
  margin: 'Marge',
  view: 'Voir',
  disableHelp: 'Désactiver Aide',
  save: 'Enregistrer',
  allChangesSaved: 'Toutes les modifications enregistrées',
  unsavedChanges: 'Modifications non enregistrées',
  instrumentPC: 'Instrument de pratique',
  instrumentPipes: 'Bagpipe',
  instrument: 'Instrument',
};
