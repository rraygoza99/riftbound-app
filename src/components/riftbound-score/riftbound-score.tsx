import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Popover,
  Select,
  MenuItem,
  Menu,
  Snackbar,
  TextField,
  Typography,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RefreshIcon from "@mui/icons-material/Refresh";
import CasinoIcon from "@mui/icons-material/Casino";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import GradeIcon from "@mui/icons-material/Grade";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FlagIcon from "@mui/icons-material/Flag";
import ShieldIcon from "@mui/icons-material/Shield";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IosShareIcon from "@mui/icons-material/IosShare";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useTheme } from "@mui/material/styles";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { ScreenBrightness } from "@capacitor-community/screen-brightness";
import "./riftbound-score.css";
import logoUrl from "../../assets/version_2.png";

const STORAGE_KEY = "riftbound-setup";
const CONFIG_KEY = "riftbound-config";

// ---- Internationalization ----
type Lang = "en" | "es" | "it" | "de" | "cs";

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "de", label: "Deutsch" },
  { code: "cs", label: "Čeština" },
];

const TRANSLATIONS: Record<string, Record<Lang, string>> = {
  home_subtitle: { en: "Score Tracker", es: "Marcador", it: "Segnapunti", de: "Punktezähler", cs: "Počítadlo skóre" },
  home_multiplayer: { en: "Multiplayer", es: "Multijugador", it: "Multigiocatore", de: "Mehrspieler", cs: "Více hráčů" },
  home_multiplayer_sub: { en: "2 – 4 players", es: "2 – 4 jugadores", it: "2 – 4 giocatori", de: "2 – 4 Spieler", cs: "2 – 4 hráči" },
  home_solo: { en: "Solo", es: "Individual", it: "Singolo", de: "Einzel", cs: "Sólo" },
  home_solo_sub: { en: "Single player", es: "Un jugador", it: "Giocatore singolo", de: "Einzelspieler", cs: "Jeden hráč" },
  home_rules: { en: "Rules", es: "Reglas", it: "Regole", de: "Regeln", cs: "Pravidla" },
  support_us: { en: "Support us", es: "Apóyanos", it: "Sostienici", de: "Unterstütze uns", cs: "Podpořte nás" },
  home_rules_sub: { en: "Official rulebook & keywords", es: "Reglamento oficial y palabras clave", it: "Regolamento ufficiale e parole chiave", de: "Offizielles Regelwerk & Schlüsselwörter", cs: "Oficiální pravidla a klíčová slova" },
  rules_hub: { en: "Rules Hub", es: "Centro de reglas", it: "Centro regole", de: "Regel-Hub", cs: "Centrum pravidel" },
  card_errata: { en: "Card Errata", es: "Erratas de cartas", it: "Errata carte", de: "Karten-Errata", cs: "Errata karet" },
  card_errata_sub: { en: "Official card text corrections", es: "Correcciones oficiales de texto", it: "Correzioni ufficiali del testo", de: "Offizielle Kartentext-Korrekturen", cs: "Oficiální opravy textu karet" },
  errata_new: { en: "New", es: "Nuevo", it: "Nuovo", de: "Neu", cs: "Nové" },
  errata_old: { en: "Previous", es: "Anterior", it: "Precedente", de: "Vorher", cs: "Předchozí" },
  ban_list: { en: "Ban List", es: "Lista de prohibiciones", it: "Lista dei bandi", de: "Bannliste", cs: "Seznam zákazů" },
  ban_list_sub: { en: "Official ban list", es: "Lista oficial de prohibiciones", it: "Lista ufficiale dei bandi", de: "Offizielle Bannliste", cs: "Oficiální seznam zákazů" },
  ban_list_note: { en: "The following are banned from play in sanctioned Constructed tournaments:", es: "Los siguientes están prohibidos en torneos Construidos sancionados:", it: "I seguenti sono banditi nei tornei Costruito sanzionati:", de: "Die folgenden sind in sanktionierten Constructed-Turnieren verboten:", cs: "Následující jsou zakázány v sankcionovaných Constructed turnajích:" },
  core_rules: { en: "Core Rules", es: "Reglas básicas", it: "Regole base", de: "Grundregeln", cs: "Základní pravidla" },
  tournament_rules: { en: "Tournament Rules", es: "Reglas de torneo", it: "Regole del torneo", de: "Turnierregeln", cs: "Turnajová pravidla" },
  rules_last_updated: { en: "Last Updated: {date}", es: "Última actualización: {date}", it: "Ultimo aggiornamento: {date}", de: "Zuletzt aktualisiert: {date}", cs: "Naposledy aktualizováno: {date}" },
  rules_search: { en: "Quick search in Rules", es: "Búsqueda rápida en reglas", it: "Ricerca rapida nelle regole", de: "Schnellsuche in Regeln", cs: "Rychlé hledání v pravidlech" },
  rules_loading: { en: "Loading rules…", es: "Cargando reglas…", it: "Caricamento regole…", de: "Regeln werden geladen…", cs: "Načítání pravidel…" },
  rules_no_results: { en: "No matching rules", es: "No hay reglas coincidentes", it: "Nessuna regola corrispondente", de: "Keine passenden Regeln", cs: "Žádná odpovídající pravidla" },
  rules_coming_soon: { en: "Not available yet", es: "Aún no disponible", it: "Non ancora disponibile", de: "Noch nicht verfügbar", cs: "Zatím nedostupné" },
  rules_results_in: { en: "in {section}", es: "en {section}", it: "in {section}", de: "in {section}", cs: "v {section}" },
  configuration: { en: "Configuration", es: "Configuración", it: "Configurazione", de: "Einstellungen", cs: "Nastavení" },
  setup_title: { en: "Create a Game", es: "Crear una partida", it: "Crea una partita", de: "Spiel erstellen", cs: "Vytvořit hru" },
  mode_2p: { en: "2 Players", es: "2 jugadores", it: "2 giocatori", de: "2 Spieler", cs: "2 hráči" },
  mode_3p: { en: "3 Players", es: "3 jugadores", it: "3 giocatori", de: "3 Spieler", cs: "3 hráči" },
  mode_4p: { en: "4 Players", es: "4 jugadores", it: "4 giocatori", de: "4 Spieler", cs: "4 hráči" },
  configure_players: { en: "Configure Players", es: "Configurar jugadores", it: "Configura giocatori", de: "Spieler einrichten", cs: "Nastavit hráče" },
  pick_legend: { en: "Pick Legend", es: "Elegir leyenda", it: "Scegli leggenda", de: "Legende wählen", cs: "Vybrat legendu" },
  game_options: { en: "Game Options", es: "Opciones de juego", it: "Opzioni di gioco", de: "Spieloptionen", cs: "Možnosti hry" },
  max_points: { en: "Max Points", es: "Puntos máximos", it: "Punti massimi", de: "Max. Punkte", cs: "Max. bodů" },
  use_xp: { en: "Use XP Tracker", es: "Usar contador XP", it: "Usa contatore XP", de: "XP-Zähler nutzen", cs: "Použít počítadlo XP" },
  launch_game: { en: "Launch Game", es: "Iniciar partida", it: "Avvia partita", de: "Spiel starten", cs: "Spustit hru" },
  reset_players: { en: "Reset Players", es: "Reiniciar jugadores", it: "Reimposta giocatori", de: "Spieler zurücksetzen", cs: "Obnovit hráče" },
  choose_legend: { en: "Choose Legend", es: "Elegir leyenda", it: "Scegli leggenda", de: "Legende wählen", cs: "Vyberte legendu" },
  no_legend: { en: "No legend", es: "Sin leyenda", it: "Nessuna leggenda", de: "Keine Legende", cs: "Bez legendy" },
  search_legends: { en: "Search legends…", es: "Buscar leyendas…", it: "Cerca leggende…", de: "Legenden suchen…", cs: "Hledat legendy…" },
  none: { en: "None", es: "Ninguna", it: "Nessuna", de: "Keine", cs: "Žádná" },
  menu: { en: "Menu", es: "Menú", it: "Menu", de: "Menü", cs: "Menu" },
  home: { en: "Home", es: "Inicio", it: "Home", de: "Start", cs: "Domů" },
  open_utilities: { en: "Open Utilities", es: "Abrir utilidades", it: "Apri utilità", de: "Werkzeuge öffnen", cs: "Otevřít nástroje" },
  pick_starting_player: { en: "Pick starting player", es: "Elegir jugador inicial", it: "Scegli chi inizia", de: "Startspieler wählen", cs: "Vybrat začínajícího hráče" },
  how_to_play: { en: "How to play", es: "Cómo jugar", it: "Come giocare", de: "Spielanleitung", cs: "Jak hrát" },
  restart_scores: { en: "Restart scores & log", es: "Reiniciar puntos y registro", it: "Azzera punteggi e log", de: "Punkte & Log zurücksetzen", cs: "Restartovat skóre a log" },
  restart_timer: { en: "Timer reset", es: "Cronómetro reiniciado", it: "Timer azzerato", de: "Timer zurückgesetzt", cs: "Časovač vynulován" },
  reset: { en: "Reset", es: "Reiniciar", it: "Reimposta", de: "Zurücksetzen", cs: "Obnovit" },
  pick_legend_action: { en: "Pick legend", es: "Elegir leyenda", it: "Scegli leggenda", de: "Legende wählen", cs: "Vybrat legendu" },
  game_log: { en: "Game Log", es: "Registro", it: "Registro", de: "Spielprotokoll", cs: "Záznam hry" },
  action_one: { en: "action", es: "acción", it: "azione", de: "Aktion", cs: "akce" },
  action_many: { en: "actions", es: "acciones", it: "azioni", de: "Aktionen", cs: "akcí" },
  no_actions: { en: "No actions logged yet", es: "Aún no hay acciones", it: "Nessuna azione registrata", de: "Noch keine Aktionen", cs: "Zatím žádné akce" },
  confirm_leave_title: { en: "Leave game?", es: "¿Salir de la partida?", it: "Uscire dalla partita?", de: "Spiel verlassen?", cs: "Opustit hru?" },
  confirm_leave_msg: { en: "This game is in progress. Your scores will be lost if you return to the menu.", es: "Esta partida está en curso. Perderás los puntos si vuelves al menú.", it: "Questa partita è in corso. Perderai i punteggi se torni al menu.", de: "Dieses Spiel läuft noch. Deine Punkte gehen verloren, wenn du zum Menü zurückkehrst.", cs: "Tato hra právě probíhá. Pokud se vrátíte do menu, přijdete o skóre." },
  confirm_leave_stay: { en: "Stay", es: "Quedarme", it: "Resta", de: "Bleiben", cs: "Zůstat" },
  confirm_leave_confirm: { en: "Leave", es: "Salir", it: "Esci", de: "Verlassen", cs: "Opustit" },
  home_trading: { en: "Trading", es: "Intercambios", it: "Scambi", de: "Tauschen", cs: "Výměny" },
  home_trading_sub: { en: "Card trade value calculator", es: "Calculadora de valor de intercambios", it: "Calcolatore del valore degli scambi", de: "Kartentausch-Wertrechner", cs: "Kalkulačka hodnoty výměny karet" },
  trading_title: { en: "Trade Calculator", es: "Calculadora de intercambio", it: "Calcolatore scambi", de: "Tausch-Rechner", cs: "Kalkulačka výměny" },
  trade_reset: { en: "Reset", es: "Reiniciar", it: "Azzera", de: "Zurücksetzen", cs: "Resetovat" },
  trade_reset_title: { en: "Clear this trade?", es: "¿Vaciar este intercambio?", it: "Svuotare questo scambio?", de: "Diesen Tausch leeren?", cs: "Vymazat tuto výměnu?" },
  trade_reset_msg: { en: "All cards and values on both sides will be removed.", es: "Se eliminarán todas las cartas y valores de ambos lados.", it: "Tutte le carte e i valori di entrambi i lati verranno rimossi.", de: "Alle Karten und Werte auf beiden Seiten werden entfernt.", cs: "Všechny karty a hodnoty na obou stranách budou odstraněny." },
  trade_reset_yes: { en: "Clear", es: "Vaciar", it: "Svuota", de: "Leeren", cs: "Vymazat" },
  cancel: { en: "Cancel", es: "Cancelar", it: "Annulla", de: "Abbrechen", cs: "Zrušit" },
  price_source: { en: "Price source", es: "Fuente de precios", it: "Fonte prezzi", de: "Preisquelle", cs: "Zdroj cen" },
  price_source_manual: { en: "Manual", es: "Manual", it: "Manuale", de: "Manuell", cs: "Ruční" },
  price_source_market: { en: "Market · TCGplayer", es: "Mercado · TCGplayer", it: "Mercato · TCGplayer", de: "Markt · TCGplayer", cs: "Trh · TCGplayer" },
  price_source_soon: { en: "Live sync · soon", es: "Sinc. en vivo · pronto", it: "Sinc. live · presto", de: "Live-Sync · bald", cs: "Živá synch. · brzy" },
  prices_updated: { en: "Prices: TCGplayer · {date}", es: "Precios: TCGplayer · {date}", it: "Prezzi: TCGplayer · {date}", de: "Preise: TCGplayer · {date}", cs: "Ceny: TCGplayer · {date}" },
  side_give: { en: "You Give", es: "Tú das", it: "Tu dai", de: "Du gibst", cs: "Ty dáváš" },
  side_receive: { en: "You Receive", es: "Tú recibes", it: "Tu ricevi", de: "Du erhältst", cs: "Ty dostáváš" },
  add_card: { en: "Add Card", es: "Añadir carta", it: "Aggiungi carta", de: "Karte hinzufügen", cs: "Přidat kartu" },
  add_cash: { en: "Add Cash", es: "Añadir efectivo", it: "Aggiungi contanti", de: "Bargeld", cs: "Přidat hotovost" },
  subtotal: { en: "Subtotal", es: "Subtotal", it: "Subtotale", de: "Zwischensumme", cs: "Mezisoučet" },
  cash: { en: "Cash", es: "Efectivo", it: "Contanti", de: "Bargeld", cs: "Hotovost" },
  trade_even: { en: "Trade is balanced", es: "El intercambio está equilibrado", it: "Lo scambio è in pari", de: "Der Tausch ist ausgeglichen", cs: "Výměna je vyrovnaná" },
  trade_up: { en: "You are up +{amount}", es: "Ganas +{amount}", it: "Sei in vantaggio di +{amount}", de: "Du liegst +{amount} vorne", cs: "Jsi v plusu +{amount}" },
  trade_owe: { en: "You owe {amount} to balance", es: "Debes {amount} para equilibrar", it: "Devi {amount} per pareggiare", de: "Du schuldest {amount} zum Ausgleich", cs: "Dlužíš {amount} k vyrovnání" },
  copy_summary: { en: "Copy Summary", es: "Copiar resumen", it: "Copia riepilogo", de: "Zusammenfassung kopieren", cs: "Kopírovat souhrn" },
  share_trade: { en: "Share", es: "Compartir", it: "Condividi", de: "Teilen", cs: "Sdílet" },
  share_as_text: { en: "Share as text", es: "Compartir como texto", it: "Condividi come testo", de: "Als Text teilen", cs: "Sdílet jako text" },
  share_as_image: { en: "Share as image", es: "Compartir como imagen", it: "Condividi come immagine", de: "Als Bild teilen", cs: "Sdílet jako obrázek" },
  summary_copied: { en: "Trade summary copied", es: "Resumen copiado", it: "Riepilogo copiato", de: "Zusammenfassung kopiert", cs: "Souhrn zkopírován" },
  search_cards: { en: "Search name, set or number…", es: "Buscar nombre, set o número…", it: "Cerca nome, set o numero…", de: "Name, Set oder Nummer suchen…", cs: "Hledat jméno, set nebo číslo…" },
  filter_all_sets: { en: "All sets", es: "Todos los sets", it: "Tutti i set", de: "Alle Sets", cs: "Všechny sety" },
  condition: { en: "Condition", es: "Estado", it: "Condizione", de: "Zustand", cs: "Stav" },
  foil: { en: "Foil", es: "Foil", it: "Foil", de: "Foil", cs: "Foil" },
  set_price: { en: "Set price", es: "Definir precio", it: "Imposta prezzo", de: "Preis festlegen", cs: "Nastavit cenu" },
  price: { en: "Price", es: "Precio", it: "Prezzo", de: "Preis", cs: "Cena" },
  amount: { en: "Amount", es: "Cantidad", it: "Importo", de: "Betrag", cs: "Částka" },
  no_cards_yet: { en: "No cards added yet", es: "Aún no hay cartas", it: "Nessuna carta aggiunta", de: "Noch keine Karten", cs: "Zatím žádné karty" },
  catalog_loading: { en: "Loading cards…", es: "Cargando cartas…", it: "Caricamento carte…", de: "Karten werden geladen…", cs: "Načítání karet…" },
  catalog_error: { en: "Couldn't load card list", es: "No se pudo cargar la lista", it: "Impossibile caricare l'elenco", de: "Kartenliste konnte nicht geladen werden", cs: "Nepodařilo se načíst seznam karet" },
  no_matches: { en: "No matching cards", es: "No hay cartas coincidentes", it: "Nessuna carta corrispondente", de: "Keine passenden Karten", cs: "Žádné odpovídající karty" },
  heads: { en: "Heads!", es: "¡Cara!", it: "Testa!", de: "Kopf!", cs: "Panna!" },
  tails: { en: "Tails!", es: "¡Cruz!", it: "Croce!", de: "Zahl!", cs: "Orel!" },
  goes_first: { en: "{name} goes first!", es: "¡{name} empieza!", it: "{name} inizia!", de: "{name} beginnt!", cs: "{name} začíná!" },
  config_game_screen: { en: "Game Screen", es: "Pantalla de juego", it: "Schermata di gioco", de: "Spielbildschirm", cs: "Herní obrazovka" },
  config_open_utilities_desc: { en: "Choose how the Utilities & Might Calculator panel is opened during gameplay.", es: "Elige cómo se abre el panel de utilidades y calculadora de poder durante la partida.", it: "Scegli come aprire il pannello utilità e calcolatore di potenza durante la partita.", de: "Wähle, wie das Werkzeug- und Stärkerechner-Panel während des Spiels geöffnet wird.", cs: "Zvolte, jak se během hry otevírá panel nástrojů a kalkulačky síly." },
  gesture: { en: "Gesture", es: "Gesto", it: "Gesto", de: "Geste", cs: "Gesto" },
  gesture_desc: { en: "Swipe left or right anywhere on the screen", es: "Desliza a izquierda o derecha en cualquier parte", it: "Scorri a sinistra o destra ovunque sullo schermo", de: "Wische irgendwo nach links oder rechts", cs: "Přejeď prstem doleva nebo doprava kdekoli" },
  button: { en: "Button", es: "Botón", it: "Pulsante", de: "Schaltfläche", cs: "Tlačítko" },
  button_desc: { en: "A button in the control bar opens the panel", es: "Un botón en la barra abre el panel", it: "Un pulsante nella barra apre il pannello", de: "Eine Schaltfläche in der Leiste öffnet das Panel", cs: "Tlačítko v liště otevře panel" },
  language: { en: "Language", es: "Idioma", it: "Lingua", de: "Sprache", cs: "Jazyk" },
  language_desc: { en: "Choose the app language.", es: "Elige el idioma de la app.", it: "Scegli la lingua dell'app.", de: "Wähle die App-Sprache.", cs: "Vyberte jazyk aplikace." },
  guide_title: { en: "How to Play", es: "Cómo jugar", it: "Come giocare", de: "Spielanleitung", cs: "Jak hrát" },
  guide_score_label: { en: "Score points", es: "Anotar puntos", it: "Segna punti", de: "Punkte machen", cs: "Získat body" },
  guide_score_desc: { en: "Tap Conquer, Hold or Ability under a player to add a point.", es: "Toca Conquistar, Mantener o Habilidad bajo un jugador para sumar un punto.", it: "Tocca Conquista, Mantieni o Abilità sotto un giocatore per aggiungere un punto.", de: "Tippe auf Erobern, Halten oder Fähigkeit unter einem Spieler, um einen Punkt hinzuzufügen.", cs: "Klepni na Dobýt, Držet nebo Schopnost pod hráčem pro přidání bodu." },
  guide_remove_label: { en: "Remove a point", es: "Quitar un punto", it: "Rimuovi un punto", de: "Punkt entfernen", cs: "Odebrat bod" },
  guide_remove_desc: { en: "Each point fills the side bar. Tap the most recent one to take it back — older points stay locked.", es: "Cada punto llena la barra lateral. Toca el más reciente para quitarlo; los anteriores quedan bloqueados.", it: "Ogni punto riempie la barra laterale. Tocca il più recente per rimuoverlo; i precedenti restano bloccati.", de: "Jeder Punkt füllt die Seitenleiste. Tippe auf den neuesten, um ihn zurückzunehmen — ältere bleiben gesperrt.", cs: "Každý bod zaplní boční lištu. Klepni na nejnovější pro jeho odebrání — starší zůstanou uzamčené." },
  guide_util_label: { en: "Utilities & Might Calculator", es: "Utilidades y calculadora de poder", it: "Utilità e calcolatore di potenza", de: "Werkzeuge & Stärkerechner", cs: "Nástroje a kalkulačka síly" },
  guide_util_desc: { en: "Swipe left or right anywhere on the game screen.", es: "Desliza a izquierda o derecha en la pantalla de juego.", it: "Scorri a sinistra o destra sulla schermata di gioco.", de: "Wische im Spielbildschirm nach links oder rechts.", cs: "Přejeď doleva či doprava na herní obrazovce." },
  guide_close_label: { en: "Close Utilities", es: "Cerrar utilidades", it: "Chiudi utilità", de: "Werkzeuge schließen", cs: "Zavřít nástroje" },
  guide_close_desc: { en: "Swipe down inside the Utilities panel.", es: "Desliza hacia abajo dentro del panel de utilidades.", it: "Scorri verso il basso nel pannello utilità.", de: "Wische im Werkzeug-Panel nach unten.", cs: "Přejeď dolů uvnitř panelu nástrojů." },
  guide_setup_label: { en: "Return to Setup", es: "Volver a la configuración", it: "Torna alla configurazione", de: "Zurück zur Einrichtung", cs: "Zpět na nastavení" },
  guide_setup_desc: { en: 'Tap "Menu" in the middle bar.', es: 'Toca "Menú" en la barra central.', it: 'Tocca "Menu" nella barra centrale.', de: 'Tippe auf "Menü" in der mittleren Leiste.', cs: 'Klepni na "Menu" v prostřední liště.' },
  guide_reset_label: { en: "Reset scores or timer", es: "Reiniciar puntos o cronómetro", it: "Azzera punteggi o timer", de: "Punkte oder Timer zurücksetzen", cs: "Resetovat skóre nebo časovač" },
  guide_reset_desc: { en: "Tap the refresh icon to reset scores & log (the timer keeps running). Press and hold it to reset the timer.", es: "Toca el icono de refrescar para reiniciar puntos y registro (el cronómetro sigue). Mantén pulsado para reiniciar el cronómetro.", it: "Tocca l'icona di aggiornamento per azzerare punteggi e log (il timer continua). Tieni premuto per azzerare il timer.", de: "Tippe auf das Aktualisieren-Symbol, um Punkte & Log zurückzusetzen (der Timer läuft weiter). Halte es gedrückt, um den Timer zurückzusetzen.", cs: "Klepni na ikonu obnovení pro reset skóre a logu (časovač běží dál). Podrž ji pro reset časovače." },
  guide_got_it: { en: "Got it!", es: "¡Entendido!", it: "Capito!", de: "Verstanden!", cs: "Rozumím!" },
  guide_tap_close: { en: "Tap anywhere to close", es: "Toca en cualquier lugar para cerrar", it: "Tocca ovunque per chiudere", de: "Zum Schließen irgendwohin tippen", cs: "Klepnutím kamkoli zavřete" },
  conquer: { en: "Conquer", es: "Conquistar", it: "Conquista", de: "Erobern", cs: "Dobýt" },
  hold: { en: "Hold", es: "Mantener", it: "Mantieni", de: "Halten", cs: "Držet" },
  ability: { en: "Ability", es: "Habilidad", it: "Abilità", de: "Fähigkeit", cs: "Schopnost" },
  utilities: { en: "Utilities", es: "Utilidades", it: "Utilità", de: "Werkzeuge", cs: "Nástroje" },
  battlefield_might: { en: "Battlefield Might", es: "Poder del campo", it: "Potenza del campo", de: "Schlachtfeld-Stärke", cs: "Síla bojiště" },
  ornn_calculator: { en: "Ornn Calculator", es: "Calculadora de Ornn", it: "Calcolatore Ornn", de: "Ornn-Rechner", cs: "Kalkulačka Ornn" },
  runes_title: { en: "How many runes I have?", es: "¿Cuántas runas tengo?", it: "Quante rune ho?", de: "Wie viele Runen habe ich?", cs: "Kolik mám run?" },
  player_1: { en: "Player 1", es: "Jugador 1", it: "Giocatore 1", de: "Spieler 1", cs: "Hráč 1" },
  player_2: { en: "Player 2", es: "Jugador 2", it: "Giocatore 2", de: "Spieler 2", cs: "Hráč 2" },
  editing_units: { en: "Editing units", es: "Editando unidades", it: "Modifica unità", de: "Einheiten bearbeiten", cs: "Úprava jednotek" },
  tap_to_edit: { en: "Tap to edit", es: "Toca para editar", it: "Tocca per modificare", de: "Zum Bearbeiten tippen", cs: "Klepnutím upravit" },
  card_name: { en: "Card name", es: "Nombre de carta", it: "Nome carta", de: "Kartenname", cs: "Název karty" },
  might: { en: "Might", es: "Poder", it: "Potenza", de: "Stärke", cs: "Síla" },
  tags_for_new: { en: "(tags for new card)", es: "(etiquetas para la nueva carta)", it: "(tag per la nuova carta)", de: "(Tags für neue Karte)", cs: "(štítky pro novou kartu)" },
  trifarian: { en: "Trifarian War Camp", es: "Campamento Trifario", it: "Accampamento Trifariano", de: "Trifarisches Kriegslager", cs: "Trifariánský tábor" },
  plus1_all: { en: "(+1 all)", es: "(+1 a todo)", it: "(+1 a tutti)", de: "(+1 alle)", cs: "(+1 vše)" },
  brush: { en: "Brush", es: "Maleza", it: "Boscaglia", de: "Gebüsch", cs: "Křoví" },
  brush_hint: { en: "(+1 bird/cat/dog/poro/ivern)", es: "(+1 bird/cat/dog/poro/ivern)", it: "(+1 bird/cat/dog/poro/ivern)", de: "(+1 bird/cat/dog/poro/ivern)", cs: "(+1 bird/cat/dog/poro/ivern)" },
  no_cards: { en: "No cards added yet", es: "Aún no hay cartas", it: "Nessuna carta aggiunta", de: "Noch keine Karten", cs: "Zatím žádné karty" },
  add_one_more: { en: "Add one more", es: "Añadir otra", it: "Aggiungine una", de: "Eine weitere", cs: "Přidat další" },
  remove_one: { en: "Remove one", es: "Quitar una", it: "Rimuovine una", de: "Eine entfernen", cs: "Odebrat jednu" },
  svellsongur_attached: { en: "Svellsongur attached", es: "Svellsongur equipado", it: "Svellsongur equipaggiato", de: "Svellsongur angelegt", cs: "Svellsongur připojen" },
  svellsongur_desc: { en: "Copies Ornn's text · max 3", es: "Copia el texto de Ornn · máx 3", it: "Copia il testo di Ornn · max 3", de: "Kopiert Ornns Text · max. 3", cs: "Kopíruje text Ornna · max 3" },
  gold_tokens: { en: "Gold tokens", es: "Fichas de oro", it: "Gettoni d'oro", de: "Gold-Marken", cs: "Zlaté žetony" },
  gold_tokens_desc: { en: "Each counts as a friendly gear", es: "Cada uno cuenta como equipo aliado", it: "Ognuno conta come equipaggiamento alleato", de: "Zählt je als eigene Ausrüstung", cs: "Každý se počítá jako přátelské vybavení" },
  gears_tap_add: { en: "Gears · tap to add", es: "Equipos · toca para añadir", it: "Equipaggiamenti · tocca per aggiungere", de: "Ausrüstung · zum Hinzufügen tippen", cs: "Vybavení · klepnutím přidat" },
  ornn_bonus: { en: "Ornn Might bonus", es: "Bono de poder de Ornn", it: "Bonus potenza di Ornn", de: "Ornn-Stärkebonus", cs: "Bonus síly Ornna" },
  gear_one: { en: "gear", es: "equipo", it: "equip.", de: "Ausrüstung", cs: "vybavení" },
  gear_many: { en: "gears", es: "equipos", it: "equip.", de: "Ausrüstungen", cs: "vybavení" },
  first_player: { en: "First player", es: "Primer jugador", it: "Primo giocatore", de: "Erster Spieler", cs: "První hráč" },
  second_player: { en: "Second player", es: "Segundo jugador", it: "Secondo giocatore", de: "Zweiter Spieler", cs: "Druhý hráč" },
  runes: { en: "runes", es: "runas", it: "rune", de: "Runen", cs: "runy" },
  turn: { en: "Turn", es: "Turno", it: "Turno", de: "Zug", cs: "Kolo" },
  runes_rule: { en: "Turn 1: first player draws 2, second draws 3. Every turn after, each draws 2.", es: "Turno 1: el primer jugador roba 2, el segundo 3. Después, cada uno roba 2.", it: "Turno 1: il primo giocatore pesca 2, il secondo 3. Dai turni successivi, ciascuno pesca 2.", de: "Zug 1: Erster Spieler zieht 2, zweiter 3. Danach zieht jeder 2.", cs: "Kolo 1: první hráč líže 2, druhý 3. Každé další kolo si každý líže 2." },
};

const LangContext = React.createContext<Lang>("en");

function useT() {
  const lang = React.useContext(LangContext);
  return React.useCallback(
    (key: string) => TRANSLATIONS[key]?.[lang] ?? TRANSLATIONS[key]?.en ?? key,
    [lang],
  );
}

function detectLang(): Lang {
  const n = (navigator.language || "en").toLowerCase();
  if (n.startsWith("es")) return "es";
  if (n.startsWith("it")) return "it";
  if (n.startsWith("de")) return "de";
  if (n.startsWith("cs")) return "cs";
  return "en";
}

function loadConfig(): { utilitiesMode: UtilitiesMode; lang: Lang } {
  try {
    const c = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "{}");
    return {
      utilitiesMode: (c.utilitiesMode as UtilitiesMode) || "gesture",
      lang: (c.lang as Lang) || detectLang(),
    };
  } catch {
    return { utilitiesMode: "gesture", lang: detectLang() };
  }
}

function persistConfig(next: Partial<{ utilitiesMode: UtilitiesMode; lang: Lang }>) {
  let cur: Record<string, unknown> = {};
  try { cur = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "{}"); } catch { /* ignore */ }
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...cur, ...next }));
}

const LEGENDS = [
  { id: "OGN-247", name: "Kai'Sa" },
  { id: "OGN-249", name: "Volibear" },
  { id: "OGN-251", name: "Jinx" },
  { id: "OGN-253", name: "Darius" },
  { id: "OGN-255", name: "Ahri" },
  { id: "OGN-257", name: "Lee Sin" },
  { id: "OGN-259", name: "Yasuo" },
  { id: "OGN-261", name: "Leona" },
  { id: "OGN-263", name: "Teemo" },
  { id: "OGN-265", name: "Viktor" },
  { id: "OGN-267", name: "Miss Fortune" },
  { id: "OGN-269", name: "Sett" },
  { id: "OGS-017", name: "Annie" },
  { id: "OGS-019", name: "Master Yi" },
  { id: "OGS-021", name: "Lux" },
  { id: "OGS-023", name: "Garen" },
  { id: "SFD-181", name: "Rumble" },
  { id: "SFD-183", name: "Lucian" },
  { id: "SFD-185", name: "Draven" },
  { id: "SFD-187", name: "Rek'Sai" },
  { id: "SFD-189", name: "Ornn" },
  { id: "SFD-193", name: "Jax" },
  { id: "SFD-195", name: "Irelia" },
  { id: "SFD-197", name: "Azir" },
  { id: "SFD-199", name: "Ezreal" },
  { id: "SFD-201", name: "Renata Glasc" },
  { id: "SFD-203", name: "Sivir" },
  { id: "SFD-205", name: "Fiora" },
  { id: "UNL-181", name: "Jhin" },
  { id: "UNL-183", name: "Rengar" },
  { id: "UNL-185", name: "Pyke" },
  { id: "UNL-187", name: "Vi" },
  { id: "UNL-189", name: "Lillia" },
  { id: "UNL-191", name: "Master Yi" },
  { id: "UNL-193", name: "Vex" },
  { id: "UNL-195", name: "Ivern" },
  { id: "UNL-197", name: "Diana" },
  { id: "UNL-199", name: "LeBlanc" },
  { id: "UNL-201", name: "Kha'Zix" },
  { id: "UNL-203", name: "Poppy" },
  { id: "VEN-139", name: "Akali" },
  { id: "VEN-141", name: "Renekton" },
  { id: "VEN-143", name: "Zed" },
  { id: "VEN-145", name: "Nasus" },
  { id: "VEN-147", name: "Shen" },
  { id: "VEN-149", name: "Jayce" },
  { id: "VEN-151", name: "Mel" },
  { id: "VEN-153", name: "Ambessa" },
  { id: "VEN-155", name: "Kennen" },
];

function getLegendUrl(id: string): string {
  return `/legends/${id}.webp`;
}

// ---- Card catalog & trading ----

interface CatalogCard {
  id: string;
  name: string;
  set: string;
  number: number;
  variant: string | null;
}

interface CardCatalog {
  generatedAt: string;
  count: number;
  cards: CatalogCard[];
}

// Card art is served from the same CDN the app already uses for legends.
function getCardThumbUrl(id: string): string {
  return `https://cdn.piltoverarchive.com/cards/${id}.webp?width=220`;
}

function useCardCatalog() {
  const [cards, setCards] = useState<CatalogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`${import.meta.env.BASE_URL}cards/catalog.json`)
      .then((r) => r.json())
      .then((json: CardCatalog) => { if (alive) { setCards(json.cards ?? []); setLoading(false); } })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, []);
  return { cards, loading, error };
}

type CardCondition = "NM" | "LP" | "MP" | "HP" | "DMG";
const CONDITIONS: CardCondition[] = ["NM", "LP", "MP", "HP", "DMG"];

interface PriceEntry { normal: number | null; foil: number | null; }
interface PriceBook {
  generatedAt: string;
  source: string;
  sourceUpdated: string;
  currency: string;
  prices: Record<string, PriceEntry>;
}

// Prices are refreshed daily from a hosted file (regenerated by CI from TCGCSV)
// so they update without shipping a new app version. The bundled copy is the
// offline/first-run fallback. TCGCSV itself is never called from the app (CORS).
const REMOTE_PRICES_URL = "https://raw.githubusercontent.com/rraygoza99/riftbound-app/prices-data/prices.json";
const PRICES_CACHE_KEY = "riftbound-prices-cache";
const PRICES_TTL_MS = 12 * 60 * 60 * 1000;

function readCachedPriceBook(): { fetchedAt: number; book: PriceBook } | null {
  try {
    const raw = localStorage.getItem(PRICES_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function usePriceBook() {
  const [book, setBook] = useState<PriceBook | null>(null);
  useEffect(() => {
    let alive = true;
    // Instant value: last cached remote copy, else the bundled fallback.
    const cached = readCachedPriceBook();
    if (cached?.book) {
      setBook(cached.book);
    } else {
      fetch(`${import.meta.env.BASE_URL}prices/prices.json`)
        .then((r) => r.json())
        .then((j: PriceBook) => { if (alive) setBook((b) => b ?? j); })
        .catch(() => { /* prices optional — falls back to manual entry */ });
    }
    // Refresh from the hosted file at most once per TTL.
    const fresh = cached && Date.now() - cached.fetchedAt < PRICES_TTL_MS;
    if (!fresh) {
      fetch(REMOTE_PRICES_URL, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("prices unavailable"))))
        .then((j: PriceBook) => {
          if (!alive || !j?.prices) return;
          setBook(j);
          try { localStorage.setItem(PRICES_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), book: j })); } catch { /* ignore */ }
        })
        .catch(() => { /* offline or not published yet — keep cached/bundled */ });
    }
    return () => { alive = false; };
  }, []);
  return book;
}

// Market price is condition-agnostic (~NM); users can still override per item.
function lookupPrice(book: PriceBook | null, cardId: string, foil: boolean): number | null {
  const e = book?.prices[cardId];
  if (!e) return null;
  return foil ? e.foil : e.normal;
}

type GameMode = "2p" | "3p" | "4p";
type AppView = "home" | "setup" | "game" | "solo" | "config" | "rules" | "trading";
type UtilitiesMode = "gesture" | "button";
type LogAction = "Conquer" | "Hold" | "Ability" | "+1" | "-1";
type PointType = "Conquer" | "Hold" | "Ability";

interface LogEntry {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  action: LogAction;
  score: number;
  gameTime: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
  xp: number;
  color: string;
  legendId: string | null;
  history: PointType[];
}

interface SetupState {
  mode: GameMode;
  players: Player[];
  maxPoints: number;
  useXp: boolean;
}

const MODE_ORDER: GameMode[] = ["2p", "3p", "4p"];

const PRESET_COLORS = [
  "#e63946",
  "#2979ff",
  "#00bcd4",
  "#ffd600",
  "#ff9800",
  "#4caf50",
  "#9c27b0",
  "#f1faee",
];

const DEFAULT_COLORS = ["#e63946", "#2979ff", "#4caf50", "#ffd600"];

const DEFAULT_NAMES: Record<GameMode, string[]> = {
  "2p": ["Player 1", "Player 2"],
  "3p": ["Player 1", "Player 2", "Player 3"],
  "4p": ["Player 1", "Player 2", "Player 3", "Player 4"],
};

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makePlayers(mode: GameMode, existing: Player[] = []): Player[] {
  return DEFAULT_NAMES[mode].map((defaultName, i) => ({
    id: existing[i]?.id ?? genId(),
    name: existing[i]?.name ?? defaultName,
    score: 0,
    xp: 0,
    color: existing[i]?.color ?? DEFAULT_COLORS[i] ?? "#ffffff",
    legendId: existing[i]?.legendId ?? null,
    history: [],
  }));
}

function formatTime(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60).toString().padStart(2, "0");
  const s = (totalSecs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function tryVibrate(ms = 25) {
  if ("vibrate" in navigator) navigator.vibrate(ms);
}

// Keeps the screen on during scoring screens via the Screen Wake Lock API.
interface WakeLockSentinelLike { release: () => Promise<void>; }
function useScreenWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinelLike> } };
    if (!nav.wakeLock) return;
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const acquire = async () => {
      try { sentinel = await nav.wakeLock!.request("screen"); } catch { /* wake lock unavailable */ }
    };
    // The OS releases the lock when the app is hidden, so re-acquire on return.
    const onVis = () => { if (document.visibilityState === "visible" && !cancelled) acquire(); };
    acquire();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      sentinel?.release().catch(() => { /* ignore */ });
    };
  }, [active]);
}

// Dims the screen after a period without interaction to save battery.
function useIdleDim(active: boolean, timeoutMs: number) {
  const [dimmed, setDimmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markActive = useCallback(() => {
    setDimmed(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (active) timerRef.current = setTimeout(() => setDimmed(true), timeoutMs);
  }, [active, timeoutMs]);
  useEffect(() => {
    if (!active) { if (timerRef.current) clearTimeout(timerRef.current); setDimmed(false); return; }
    markActive();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, markActive]);
  // Lower the actual hardware backlight while dimmed (-1 restores the user's setting).
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    ScreenBrightness.setBrightness({ brightness: active && dimmed ? 0.15 : -1 }).catch(() => { /* ignore */ });
  }, [dimmed, active]);
  useEffect(() => () => {
    if (Capacitor.isNativePlatform()) ScreenBrightness.setBrightness({ brightness: -1 }).catch(() => { /* ignore */ });
  }, []);
  return { dimmed, markActive };
}

const IDLE_DIM_MS = 120000;

function loadSetup(): SetupState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SetupState>;
      if (parsed.mode && parsed.players) {
        const mode: GameMode = (["2p", "3p", "4p"] as GameMode[]).includes(parsed.mode as GameMode) ? (parsed.mode as GameMode) : "2p";
        return {
          mode,
          players: (parsed.players as Player[]).map((p) => ({ ...p, score: 0, xp: 0, legendId: p.legendId ?? null, history: [] })),
          maxPoints: parsed.maxPoints ?? 8,
          useXp: parsed.useXp ?? false,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { mode: "2p", players: makePlayers("2p"), maxPoints: 8, useXp: false };
}

// Player Panel

interface PlayerPanelProps {
  player: Player;
  flipped: boolean;
  highlighted?: boolean;
  maxPoints: number;
  useXp: boolean;
  hideActions?: boolean;
  onChangeScore: (id: string, delta: number) => void;
  onChangeXp: (id: string, delta: number) => void;
  onLogAction: (id: string, action: LogAction) => void;
}

const POINT_COLORS: Record<PointType, string> = {
  Conquer: "#ff6d3a",
  Hold: "#2f7bff",
  Ability: "#a44bff",
};

const POINT_ICONS: Record<PointType, typeof FlagIcon> = {
  Conquer: FlagIcon,
  Hold: ShieldIcon,
  Ability: AutoAwesomeIcon,
};

const PlayerPanel = React.memo(function PlayerPanel({ player, flipped, highlighted = false, maxPoints, useXp, onChangeXp, onLogAction, hideActions = false }: PlayerPanelProps) {
  const atMax = player.score >= maxPoints;
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  return (
    <Box
      className={`rb-player-panel${flipped ? " rb-player-panel--flipped" : ""}${highlighted ? " rb-player-panel--highlighted" : ""}`}
      style={{ background: `linear-gradient(160deg, ${isDark ? "#09091a" : "#f4f4f8"} 0%, ${player.color}1a 100%)`, '--rb-hl-color': player.color } as React.CSSProperties}
    >
      {player.legendId && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `url(${getLegendUrl(player.legendId)})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          opacity: isDark ? 1 : 0.92,
        }} />
      )}
      {player.legendId && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: isDark
            ? "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.62) 100%)"
            : "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.10) 45%, rgba(0,0,0,0.42) 100%)",
        }} />
      )}

      {hideActions ? (
        <Box className="rb-vert-layout">
          <IconButton
            className="rb-score-btn"
            onClick={() => { tryVibrate(); onLogAction(player.id, flipped ? "+1" : "-1"); }}
            disableRipple
          >
            {flipped ? <AddIcon className="rb-score-icon" /> : <RemoveIcon className="rb-score-icon" />}
          </IconButton>
          <Box className="rb-vert-middle">
            <Typography
              className="rb-score-number"
              style={{ color: atMax ? player.color : (isDark ? "#ffffff" : "#111111") }}
            >
              {player.score}
            </Typography>
            <Box className="rb-player-badge rb-player-badge--vert" style={{ borderColor: `${player.color}55` }}>
              <Typography className="rb-player-badge-text">{player.name}</Typography>
            </Box>
          </Box>
          <IconButton
            className="rb-score-btn"
            onClick={() => { tryVibrate(); onLogAction(player.id, flipped ? "-1" : "+1"); }}
            disableRipple
          >
            {flipped ? <RemoveIcon className="rb-score-icon" /> : <AddIcon className="rb-score-icon" />}
          </IconButton>
        </Box>
      ) : (
        <>
          <Box className="rb-player-badge" style={{ borderColor: `${player.color}55` }}>
            <Typography className="rb-player-badge-text">{player.name}</Typography>
          </Box>

          {useXp && (
            <Box className="rb-xp-bar">
              <Typography className="rb-xp-label">XP</Typography>
              <IconButton size="small" className="rb-xp-btn" onClick={() => onChangeXp(player.id, -1)}>
                <RemoveIcon sx={{ fontSize: 22 }} />
              </IconButton>
              <Typography className="rb-xp-value">{player.xp}</Typography>
              <IconButton size="small" className="rb-xp-btn" onClick={() => onChangeXp(player.id, 1)}>
                <AddIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, position: "relative", zIndex: 1, width: "100%" }}>
            <Box className="rb-score-row">
              <Typography className="rb-score-number" style={{ color: atMax ? player.color : (isDark ? "#ffffff" : "#111111") }}>
                {player.score}
              </Typography>
            </Box>
            <Box className="rb-action-row">
              <Box className="rb-action-item">
                <IconButton className="rb-action-icon rb-conquer-btn" disableRipple onClick={() => onLogAction(player.id, "Conquer")}>
                  <FlagIcon />
                </IconButton>
                <Typography className="rb-action-label">{t("conquer")}</Typography>
              </Box>
              <Box className="rb-action-item">
                <IconButton className="rb-action-icon rb-hold-btn" disableRipple onClick={() => onLogAction(player.id, "Hold")}>
                  <ShieldIcon />
                </IconButton>
                <Typography className="rb-action-label">{t("hold")}</Typography>
              </Box>
              <Box className="rb-action-item">
                <IconButton className="rb-action-icon rb-ability-btn" disableRipple onClick={() => onLogAction(player.id, "Ability")}>
                  <AutoAwesomeIcon />
                </IconButton>
                <Typography className="rb-action-label">{t("ability")}</Typography>
              </Box>
            </Box>
          </Box>

          <Box className="rb-point-bar" aria-label="score points">
            {Array.from({ length: maxPoints }).map((_, i) => {
              const type = player.history[i];
              const filled = i < player.history.length;
              const isLast = filled && i === player.history.length - 1;
              return (
                <Box
                  key={i}
                  className={`rb-point-seg${filled ? " rb-point-seg--filled" : ""}${isLast ? " rb-point-seg--last" : ""}`}
                  style={filled ? { background: POINT_COLORS[type!], boxShadow: `0 0 10px ${POINT_COLORS[type!]}66` } : undefined}
                  onClick={isLast ? () => { tryVibrate(); onLogAction(player.id, "-1"); } : undefined}
                >
                  {filled && React.createElement(POINT_ICONS[type!], { className: "rb-point-seg-icon" })}
                </Box>
              );
            })}
          </Box>
        </>
      )}

    </Box>
  );
});

// Might Calculator

const BRUSH_TAGS = ["bird", "cat", "dog", "poro", "ivern"] as const;
type BrushTag = typeof BRUSH_TAGS[number];

// Auto-tag keywords (English + Spanish), accent- and case-insensitive.
const TAG_KEYWORDS: { kw: string; tag: BrushTag }[] = [
  { kw: "cat", tag: "cat" }, { kw: "gato", tag: "cat" },
  { kw: "dog", tag: "dog" }, { kw: "perro", tag: "dog" },
  { kw: "bird", tag: "bird" }, { kw: "pajaro", tag: "bird" },
  { kw: "poro", tag: "poro" },
  { kw: "ivern", tag: "ivern" },
];

function normalizeText(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectTags(name: string): BrushTag[] {
  const n = normalizeText(name);
  const found = new Set<BrushTag>();
  for (const { kw, tag } of TAG_KEYWORDS) {
    if (n.includes(kw)) found.add(tag);
  }
  return Array.from(found);
}

interface MightCard {
  id: string;
  name: string;
  might: number;
  tags: BrushTag[];
}

interface CardGroup { name: string; might: number; tags: BrushTag[]; count: number; }

const QUICK_CARDS: { name: string; might: number; tags: BrushTag[] }[] = [
  { name: "Recruit", might: 1, tags: [] },
  { name: "Bird", might: 1, tags: ["bird"] },
  { name: "Sand Soldier", might: 2, tags: [] },
  { name: "Mech", might: 3, tags: [] },
  { name: "Sprite", might: 3, tags: [] },
];

const MIGHT_STORAGE_KEY = "riftbound-might-calc";

interface PlayerMight { cards: MightCard[]; trifarian: boolean; brush: boolean; }
type MightState = { p1: PlayerMight; p2: PlayerMight };

function emptyPlayerMight(): PlayerMight {
  return { cards: [], trifarian: false, brush: false };
}

function loadMightState(): MightState {
  try {
    const raw = localStorage.getItem(MIGHT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MightState>;
      if (parsed && parsed.p1 && parsed.p2) {
        return {
          p1: { cards: parsed.p1.cards ?? [], trifarian: !!parsed.p1.trifarian, brush: !!parsed.p1.brush },
          p2: { cards: parsed.p2.cards ?? [], trifarian: !!parsed.p2.trifarian, brush: !!parsed.p2.brush },
        };
      }
    }
  } catch { /* ignore */ }
  return { p1: emptyPlayerMight(), p2: emptyPlayerMight() };
}

function mightTotal(p: PlayerMight): number {
  return p.cards.reduce((sum, c) => sum + c.might + (p.trifarian ? 1 : 0) + (p.brush && c.tags.some((t) => BRUSH_TAGS.includes(t)) ? 1 : 0), 0);
}

function MightCalculator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const [state, setState] = useState<MightState>(loadMightState);
  const [active, setActive] = useState<"p1" | "p2">("p1");
  const [newName, setNewName] = useState("");
  const [newMight, setNewMight] = useState<number | "">(1);
  const [newTags, setNewTags] = useState<BrushTag[]>([]);

  // Persist across panel/screen changes and app restarts.
  // Debounced so rapid edits don't trigger a synchronous localStorage write
  // each tap; skips the initial (just-loaded) value and flushes on unmount.
  const stateRef = useRef(state);
  stateRef.current = state;
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const id = setTimeout(() => {
      try { localStorage.setItem(MIGHT_STORAGE_KEY, JSON.stringify(stateRef.current)); } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(id);
  }, [state]);
  useEffect(() => () => {
    try { localStorage.setItem(MIGHT_STORAGE_KEY, JSON.stringify(stateRef.current)); } catch { /* ignore */ }
  }, []);

  const cur = state[active];
  const cards = cur.cards;
  const trifarian = cur.trifarian;
  const brush = cur.brush;

  function setCards(updater: (prev: MightCard[]) => MightCard[]) {
    setState((s) => ({ ...s, [active]: { ...s[active], cards: updater(s[active].cards) } }));
  }
  function setTrifarian(v: boolean) {
    setState((s) => ({ ...s, [active]: { ...s[active], trifarian: v } }));
  }
  function setBrush(v: boolean) {
    setState((s) => ({ ...s, [active]: { ...s[active], brush: v } }));
  }

  function effectiveMight(card: { might: number; tags: BrushTag[] }) {
    return card.might + (trifarian ? 1 : 0) + (brush && card.tags.some((t) => BRUSH_TAGS.includes(t)) ? 1 : 0);
  }

  function toggleNewTag(tag: BrushTag) {
    setNewTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function addCard() {
    const might = typeof newMight === "number" ? newMight : 1;
    if (might < 1) return;
    const tags = Array.from(new Set<BrushTag>([...newTags, ...detectTags(newName)]));
    setCards((prev) => [...prev, { id: genId(), name: newName.trim() || `Card ${prev.length + 1}`, might, tags }]);
    setNewName("");
    setNewMight(1);
    setNewTags([]);
  }

  function quickAdd(name: string, might: number, tags: BrushTag[]) {
    setCards((prev) => [...prev, { id: genId(), name, might, tags }]);
  }

  function duplicateGroup(name: string, might: number, tags: BrushTag[]) {
    setCards((prev) => [...prev, { id: genId(), name, might, tags }]);
  }

  function removeOneFromGroup(name: string, might: number, tags: BrushTag[]) {
    const tagKey = [...tags].sort().join(",");
    setCards((prev) => {
      const idx = [...prev].reverse().findIndex((c) => c.name === name && c.might === might && [...c.tags].sort().join(",") === tagKey);
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return prev.filter((_, i) => i !== realIdx);
    });
  }

  // Group by name+might+tags
  const groups: CardGroup[] = [];
  for (const card of cards) {
    const tagKey = [...card.tags].sort().join(",");
    const existing = groups.find((g) => g.name === card.name && g.might === card.might && [...g.tags].sort().join(",") === tagKey);
    if (existing) existing.count++;
    else groups.push({ name: card.name, might: card.might, tags: card.tags, count: 1 });
  }

  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const textPrimary = isDark ? "#fff" : "#111";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const tagChipStyle = (active: boolean) => ({
    borderRadius: "50px",
    textTransform: "none" as const,
    fontWeight: 600,
    fontSize: "0.7rem",
    px: 1,
    py: 0.25,
    minWidth: 0,
    lineHeight: 1.4,
    border: `1px solid ${active ? "rgba(76,175,80,0.6)" : border}`,
    background: active ? "rgba(76,175,80,0.18)" : surface,
    color: active ? "#4caf50" : textMuted,
    "&:hover": { background: active ? "rgba(76,175,80,0.28)" : (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)") },
  });

  const p1Total = mightTotal(state.p1);
  const p2Total = mightTotal(state.p2);
  const detectedTags = detectTags(newName);

  const totalBar = (key: "p1" | "p2", label: string, value: number, flipped: boolean) => {
    const sel = active === key;
    return (
      <Box
        onClick={() => setActive(key)}
        sx={{
          flexShrink: 0, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          transform: flipped ? "rotate(180deg)" : "none",
          background: sel ? "rgba(41,121,255,0.16)" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
          border: `1.5px solid ${sel ? "rgba(41,121,255,0.55)" : (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)")}`,
          borderRadius: 2, px: 2, py: 0.9,
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, color: textPrimary, fontSize: "0.92rem", lineHeight: 1.2 }}>{label}</Typography>
          <Typography sx={{ fontSize: "0.64rem", color: sel ? "#2979ff" : textMuted }}>{sel ? t("editing_units") : t("tap_to_edit")}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#2979ff", lineHeight: 1 }}>{value}</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "hidden" }}>
      {/* Player 2 total (top, flipped for across-table) */}
      {totalBar("p2", t("player_2"), p2Total, true)}

      {/* Editor for the active player */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
      {/* Add card row */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
        <TextField
          size="small"
          placeholder={t("card_name")}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCard()}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              background: surface, borderRadius: 2, color: textPrimary,
              "& fieldset": { borderColor: border },
              "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" },
            },
            "& input::placeholder": { color: textMuted },
          }}
        />
        <TextField
          size="small"
          type="number"
          placeholder={t("might")}
          value={newMight}
          onChange={(e) => setNewMight(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
          onKeyDown={(e) => e.key === "Enter" && addCard()}
          slotProps={{ htmlInput: { min: 0, style: { textAlign: "center" } } }}
          sx={{
            width: 72,
            "& .MuiOutlinedInput-root": {
              background: surface, borderRadius: 2, color: textPrimary,
              "& fieldset": { borderColor: border },
              "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" },
            },
          }}
        />
        <IconButton onClick={addCard} sx={{ background: "#2979ff", color: "#fff", borderRadius: 2, "&:hover": { background: "#1565c0" } }} size="small">
          <AddIcon />
        </IconButton>
      </Box>

      {/* Tag toggles for manual add */}
      <Box sx={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap" }}>
        {BRUSH_TAGS.map((tag) => (
          <Button key={tag} size="small" onClick={() => toggleNewTag(tag)} sx={tagChipStyle(newTags.includes(tag) || detectedTags.includes(tag))}>
            {tag}
          </Button>
        ))}
        {newTags.length > 0 && (
          <Typography sx={{ fontSize: "0.7rem", color: textMuted, alignSelf: "center", ml: 0.5 }}>
            {t("tags_for_new")}
          </Typography>
        )}
      </Box>

      {/* Quick-add chips */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px", flexShrink: 0 }}>
        {QUICK_CARDS.map((qc) => (
          <Button
            key={qc.name}
            size="small"
            onClick={() => quickAdd(qc.name, qc.might, qc.tags)}
            sx={{
              borderRadius: "50px", textTransform: "none", fontWeight: 600, fontSize: "0.75rem",
              px: 1.5, py: 0.4, background: surface, border: `1px solid ${border}`,
              color: textPrimary, minWidth: 0, lineHeight: 1.4,
              "&:hover": { background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)" },
            }}
          >
            {qc.name}&nbsp;<Typography component="span" sx={{ fontSize: "0.68rem", color: "#ffd600", fontWeight: 700 }}>+{qc.might}</Typography>
            {qc.tags.length > 0 && <Typography component="span" sx={{ fontSize: "0.62rem", color: "#4caf50", ml: 0.5 }}>·{qc.tags[0]}</Typography>}
          </Button>
        ))}
      </Box>

      {/* Battlefield checkboxes */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexShrink: 0 }}>
        <FormControlLabel
          control={<Checkbox checked={trifarian} onChange={(e) => setTrifarian(e.target.checked)} size="small" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", "&.Mui-checked": { color: "#ffd600" }, p: 0.5 }} />}
          label={<Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: textPrimary }}>{t("trifarian")} <Typography component="span" sx={{ fontSize: "0.68rem", color: textMuted }}>{t("plus1_all")}</Typography></Typography>}
          sx={{ mx: 0 }}
        />
        <FormControlLabel
          control={<Checkbox checked={brush} onChange={(e) => setBrush(e.target.checked)} size="small" sx={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", "&.Mui-checked": { color: "#4caf50" }, p: 0.5 }} />}
          label={<Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: textPrimary }}>{t("brush")} <Typography component="span" sx={{ fontSize: "0.68rem", color: textMuted }}>{t("brush_hint")}</Typography></Typography>}
          sx={{ mx: 0 }}
        />
      </Box>

      {/* Card list */}
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", pr: 0.5 }}>
        {groups.length === 0 && (
          <Typography sx={{ color: textMuted, fontSize: "0.85rem", textAlign: "center", mt: 3 }}>
            {t("no_cards")}
          </Typography>
        )}
        {groups.map((group) => {
          const eff = effectiveMight(group);
          const hasBrushBonus = brush && group.tags.some((t) => BRUSH_TAGS.includes(t));
          const groupKey = `${group.name}__${group.might}__${[...group.tags].sort().join(",")}`;
          return (
            <Box key={groupKey} sx={{ display: "flex", alignItems: "center", gap: 1, background: surface, border: `1px solid ${border}`, borderRadius: 2, px: 1.5, py: 0.8 }}>
              {/* Count badge */}
              <Box sx={{ minWidth: 26, height: 26, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", color: textPrimary, lineHeight: 1 }}>{group.count}</Typography>
              </Box>

              {/* Name + tags */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: textPrimary, fontSize: "0.92rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {group.name}
                </Typography>
                {group.tags.length > 0 && (
                  <Box sx={{ display: "flex", gap: "3px", flexWrap: "wrap", mt: 0.2 }}>
                    {group.tags.map((tag) => (
                      <Typography key={tag} component="span" sx={{ fontSize: "0.6rem", fontWeight: 700, color: hasBrushBonus ? "#4caf50" : textMuted, background: hasBrushBonus ? "rgba(76,175,80,0.12)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"), borderRadius: "4px", px: 0.6, py: 0.1, textTransform: "capitalize" }}>
                        {tag}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Might per unit × count */}
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#ffd600", flexShrink: 0 }}>
                {eff}
                {group.count > 1 && (
                  <Typography component="span" sx={{ fontWeight: 400, fontSize: "0.72rem", color: textMuted }}>×{group.count}={eff * group.count}</Typography>
                )}
              </Typography>

              <IconButton size="small" onClick={() => duplicateGroup(group.name, group.might, group.tags)} sx={{ color: textMuted, p: 0.5 }} title={t("add_one_more")}>
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" onClick={() => removeOneFromGroup(group.name, group.might, group.tags)} sx={{ color: textMuted, p: 0.5 }} title={t("remove_one")}>
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>
      </Box>

      {/* Player 1 total (bottom) */}
      {totalBar("p1", t("player_1"), p1Total, false)}
    </Box>
  );
}

// Ornn Might Calculator

// Blue (Mind) / Green (Calm) gears — each counts as +1 friendly gear for Ornn's passive.
// Svellsongur is handled separately because it copies Ornn's text.
const ORNN_GEARS = [
  "Brutalizer",
  "Chemtech Cask",
  "Cloth Armor",
  "Doran's Shield",
  "Energy Conduit",
  "Experimental Hexplate",
  "Forgefire Cape",
  "Forgotten Signpost",
  "Frigid Jewel",
  "Garbage Grabber",
  "Guardian Angel",
  "Gutter Palace",
  "Heart of Dark Ice",
  "Hextech Anomaly",
  "Honeyfruit",
  "Mask of Foresight",
  "Mushroom Pouch",
  "Orb of Regret",
  "Poro Snax",
  "Rabadon's Deathcrown",
  "Seal of Focus",
  "Seal of Insight",
  "Shurelya's Requiem",
  "Solari Shrine",
  "Soul Sword",
  "Spirit's Refuge",
  "Sprite Fountain",
  "Sterak's Gage",
  "Sumpworks Map",
  "Temporal Portal",
  "The Zero Drive",
  "World Atlas",
  "Zhonya's Hourglass",
];

const ORNN_STORAGE_KEY = "riftbound-ornn-calc";

interface OrnnState { gearCounts: Record<string, number>; svellsongur: number; goldTokens: number; }

function loadOrnnState(): OrnnState {
  try {
    const raw = localStorage.getItem(ORNN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OrnnState>;
      return {
        gearCounts: (parsed.gearCounts && typeof parsed.gearCounts === "object") ? parsed.gearCounts : {},
        svellsongur: Math.max(0, Math.min(3, Number(parsed.svellsongur) || 0)),
        goldTokens: Math.max(0, Number(parsed.goldTokens) || 0),
      };
    }
  } catch { /* ignore */ }
  return { gearCounts: {}, svellsongur: 0, goldTokens: 0 };
}

function OrnnCalculator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const initial = useRef(loadOrnnState()).current;
  const [gearCounts, setGearCounts] = useState<Record<string, number>>(initial.gearCounts);
  const [svellsongur, setSvellsongur] = useState(initial.svellsongur);
  const [goldTokens, setGoldTokens] = useState(initial.goldTokens);

  // Persist across panel/screen changes and app restarts. Debounced so rapid
  // edits don't trigger a synchronous localStorage write each tap; skips the
  // initial (just-loaded) value and flushes on unmount.
  const stateRef = useRef<OrnnState>(initial);
  stateRef.current = { gearCounts, svellsongur, goldTokens };
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const id = setTimeout(() => {
      try { localStorage.setItem(ORNN_STORAGE_KEY, JSON.stringify(stateRef.current)); } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(id);
  }, [gearCounts, svellsongur, goldTokens]);
  useEffect(() => () => {
    try { localStorage.setItem(ORNN_STORAGE_KEY, JSON.stringify(stateRef.current)); } catch { /* ignore */ }
  }, []);

  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const textPrimary = isDark ? "#fff" : "#111";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const selectedGears = Object.values(gearCounts).reduce((a, b) => a + b, 0);
  // Friendly gears = listed gears + each Svellsongur + each gold token
  const totalGears = selectedGears + svellsongur + goldTokens;
  // Ornn's own passive grants +totalGears. Each Svellsongur copies that text → ×(1 + svellsongur).
  const mightBonus = totalGears * (1 + svellsongur);

  function addGear(name: string) {
    setGearCounts((p) => ({ ...p, [name]: (p[name] || 0) + 1 }));
  }
  function removeGear(name: string) {
    setGearCounts((p) => {
      const next = { ...p };
      const n = (next[name] || 0) - 1;
      if (n <= 0) delete next[name];
      else next[name] = n;
      return next;
    });
  }
  function resetAll() {
    setGearCounts({});
    setSvellsongur(0);
    setGoldTokens(0);
  }

  const stepper = (
    value: number,
    onDec: () => void,
    onInc: () => void,
    accent: string,
    decDisabled: boolean,
    incDisabled: boolean,
  ) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
      <IconButton size="small" onClick={onDec} disabled={decDisabled} sx={{ background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 1.5, p: 0.4, "&.Mui-disabled": { opacity: 0.3, color: textMuted } }}>
        <RemoveIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: accent, minWidth: 22, textAlign: "center" }}>{value}</Typography>
      <IconButton size="small" onClick={onInc} disabled={incDisabled} sx={{ background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 1.5, p: 0.4, "&.Mui-disabled": { opacity: 0.3, color: textMuted } }}>
        <AddIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, height: "100%", overflow: "hidden" }}>
      {/* Special counters: Svellsongur + Gold tokens */}
      <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: isDark ? "rgba(41,121,255,0.10)" : "rgba(41,121,255,0.08)", border: `1px solid rgba(41,121,255,0.30)`, borderRadius: 2, px: 1.5, py: 0.8 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: textPrimary }}>{t("svellsongur_attached")}</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: textMuted }}>{t("svellsongur_desc")}</Typography>
          </Box>
          {stepper(svellsongur, () => setSvellsongur((v) => Math.max(0, v - 1)), () => setSvellsongur((v) => Math.min(3, v + 1)), "#2979ff", svellsongur <= 0, svellsongur >= 3)}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, background: isDark ? "rgba(255,214,0,0.08)" : "rgba(255,193,7,0.10)", border: `1px solid rgba(255,193,7,0.35)`, borderRadius: 2, px: 1.5, py: 0.8 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: textPrimary }}>{t("gold_tokens")}</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: textMuted }}>{t("gold_tokens_desc")}</Typography>
          </Box>
          {stepper(goldTokens, () => setGoldTokens((v) => Math.max(0, v - 1)), () => setGoldTokens((v) => v + 1), "#ffb300", goldTokens <= 0, false)}
        </Box>
      </Box>

      {/* Gear list */}
      <Typography sx={{ flexShrink: 0, fontSize: "0.66rem", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: textMuted, mt: 0.3 }}>
        {t("gears_tap_add")}
      </Typography>
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px", pr: 0.5 }}>
        {ORNN_GEARS.map((name) => {
          const count = gearCounts[name] || 0;
          const active = count > 0;
          return (
            <Box
              key={name}
              onClick={() => addGear(name)}
              sx={{
                display: "flex", alignItems: "center", gap: 1, cursor: "pointer",
                background: active ? (isDark ? "rgba(76,175,80,0.14)" : "rgba(76,175,80,0.12)") : surface,
                border: `1px solid ${active ? "rgba(76,175,80,0.45)" : border}`,
                borderRadius: 2, px: 1.5, py: 0.7,
                transition: "background 0.12s",
              }}
            >
              <Box sx={{ minWidth: 26, height: 26, borderRadius: "50%", background: active ? "rgba(76,175,80,0.25)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", color: active ? "#4caf50" : textMuted, lineHeight: 1 }}>{count}</Typography>
              </Box>
              <Typography sx={{ flex: 1, minWidth: 0, color: textPrimary, fontSize: "0.9rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name}
              </Typography>
              {active && (
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeGear(name); }} sx={{ color: textMuted, p: 0.4 }} title={t("remove_one")}>
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Result */}
      <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 0.5, background: isDark ? "rgba(41,121,255,0.15)" : "rgba(41,121,255,0.10)", border: `1px solid rgba(41,121,255,0.35)`, borderRadius: 2, px: 2, py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontWeight: 700, color: textPrimary, fontSize: "0.95rem" }}>{t("ornn_bonus")}</Typography>
            <Typography sx={{ fontSize: "0.68rem", color: textMuted }}>
              {totalGears} {totalGears === 1 ? t("gear_one") : t("gear_many")} × (1 + {svellsongur} Svellsongur)
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.8rem", color: "#2979ff", lineHeight: 1 }}>+{mightBonus}</Typography>
        </Box>
        {(selectedGears > 0 || svellsongur > 0 || goldTokens > 0) && (
          <Button size="small" onClick={resetAll} sx={{ alignSelf: "flex-start", textTransform: "none", fontSize: "0.72rem", color: textMuted, p: 0, minWidth: 0, "&:hover": { background: "transparent", color: textPrimary } }}>
            {t("reset")}
          </Button>
        )}
      </Box>
    </Box>
  );
}

// Runes Teller — "How many runes I have?"

const RUNES_STORAGE_KEY = "riftbound-runes-turn";

function loadRunesTurn(): number {
  try {
    const raw = localStorage.getItem(RUNES_STORAGE_KEY);
    if (raw) return Math.max(1, Number(raw) || 1);
  } catch { /* ignore */ }
  return 1;
}

// First player: 2 runes on turn 1, +2 each following turn → 2 × turn.
// Second player: 3 runes on turn 1, +2 each following turn → 2 × turn + 1.
function runesForPlayer(turn: number, isFirst: boolean): number {
  if (turn < 1) return 0;
  return isFirst ? 2 * turn : 2 * turn + 1;
}

function RunesCalculator() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const [turn, setTurn] = useState<number>(loadRunesTurn);

  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const textPrimary = isDark ? "#fff" : "#111";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const turnRef = useRef(turn);
  turnRef.current = turn;
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const id = setTimeout(() => {
      try { localStorage.setItem(RUNES_STORAGE_KEY, String(turnRef.current)); } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(id);
  }, [turn]);
  useEffect(() => () => {
    try { localStorage.setItem(RUNES_STORAGE_KEY, String(turnRef.current)); } catch { /* ignore */ }
  }, []);

  const firstRunes = runesForPlayer(turn, true);
  const secondRunes = runesForPlayer(turn, false);

  const playerCard = (label: string, runes: number, accent: string) => (
    <Box sx={{
      flex: 1,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5,
      background: surface, border: `1px solid ${border}`, borderRadius: 3, py: 3, px: 1.5,
    }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: textMuted, textAlign: "center" }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 900, fontSize: "3rem", lineHeight: 1, color: accent }}>{runes}</Typography>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: textMuted }}>{t("runes")}</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%", overflow: "hidden", justifyContent: "center" }}>
      {/* Player tellers */}
      <Box sx={{ display: "flex", gap: 1.2, flexShrink: 0 }}>
        {playerCard(t("first_player"), firstRunes, "#2979ff")}
        {playerCard(t("second_player"), secondRunes, "#ff5c8a")}
      </Box>

      {/* Turn counter with steppers */}
      <Box sx={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 2.5,
        background: isDark ? "rgba(41,121,255,0.10)" : "rgba(41,121,255,0.08)",
        border: `1px solid rgba(41,121,255,0.30)`, borderRadius: 3, py: 2, px: 2,
      }}>
        <IconButton onClick={() => setTurn((t) => Math.max(1, t - 1))} disabled={turn <= 1} sx={{ background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 2, p: 1, "&.Mui-disabled": { opacity: 0.3, color: textMuted } }}>
          <RemoveIcon />
        </IconButton>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 70 }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: textMuted }}>{t("turn")}</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: "2.4rem", lineHeight: 1, color: textPrimary }}>{turn}</Typography>
        </Box>
        <IconButton onClick={() => setTurn((t) => t + 1)} sx={{ background: surface, border: `1px solid ${border}`, color: textPrimary, borderRadius: 2, p: 1 }}>
          <AddIcon />
        </IconButton>
      </Box>

      <Typography sx={{ flexShrink: 0, textAlign: "center", fontSize: "0.7rem", color: textMuted, px: 2 }}>
        {t("runes_rule")}
      </Typography>
    </Box>
  );
}

// How To Guide

const GUIDE_TIPS: { labelKey: string; descKey: string; icon: React.ReactNode }[] = [
  {
    labelKey: "guide_score_label",
    descKey: "guide_score_desc",
    icon: (
      <Box sx={{ display: "flex", gap: 0.75 }}>
        <Box className="rb-guide-chip" sx={{ background: "#ff6d3a" }}><FlagIcon sx={{ fontSize: 20, color: "#fff" }} /></Box>
        <Box className="rb-guide-chip" sx={{ background: "#2f7bff" }}><ShieldIcon sx={{ fontSize: 20, color: "#fff" }} /></Box>
        <Box className="rb-guide-chip" sx={{ background: "#a44bff" }}><AutoAwesomeIcon sx={{ fontSize: 20, color: "#fff" }} /></Box>
      </Box>
    ),
  },
  {
    labelKey: "guide_remove_label",
    descKey: "guide_remove_desc",
    icon: (
      <Box sx={{ position: "relative", width: 30 }}>
        <Box className="rb-guide-chip rb-guide-chip--bar" sx={{ background: "#a44bff" }}>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: "#fff" }} />
        </Box>
        <TouchAppIcon className="rb-guide-icon rb-guide-tap" sx={{ fontSize: 26, color: "#fff", position: "absolute", right: -12, bottom: -10 }} />
      </Box>
    ),
  },
  {
    labelKey: "guide_util_label",
    descKey: "guide_util_desc",
    icon: <TouchAppIcon className="rb-guide-icon rb-guide-h" sx={{ fontSize: 36, color: "#fff" }} />,
  },
  {
    labelKey: "guide_close_label",
    descKey: "guide_close_desc",
    icon: <TouchAppIcon className="rb-guide-icon rb-guide-u" sx={{ fontSize: 36, color: "#fff" }} />,
  },
  {
    labelKey: "guide_setup_label",
    descKey: "guide_setup_desc",
    icon: <TouchAppIcon className="rb-guide-icon rb-guide-tap" sx={{ fontSize: 36, color: "#fff" }} />,
  },
  {
    labelKey: "guide_reset_label",
    descKey: "guide_reset_desc",
    icon: (
      <Box sx={{ position: "relative", width: 30 }}>
        <RefreshIcon sx={{ fontSize: 32, color: "#fff" }} />
        <TouchAppIcon className="rb-guide-icon rb-guide-tap" sx={{ fontSize: 24, color: "#fff", position: "absolute", right: -12, bottom: -10 }} />
      </Box>
    ),
  },
];

function HowToGuide({ onDismiss }: { onDismiss: () => void }) {
  const t = useT();
  return (
    <Box
      onClick={onDismiss}
      sx={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.88)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 2, px: 3,
      }}
    >
      <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", letterSpacing: 0.2, mb: 0.5 }}>
        {t("guide_title")}
      </Typography>

      {GUIDE_TIPS.map((tip) => (
        <Box
          key={tip.labelKey}
          sx={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px", px: 2.5, py: 2,
            width: "100%", maxWidth: 360,
            display: "flex", alignItems: "center", gap: 2,
          }}
        >
          <Box sx={{ minWidth: 44, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            {tip.icon}
          </Box>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3 }}>
              {t(tip.labelKey)}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", mt: 0.3 }}>
              {t(tip.descKey)}
            </Typography>
          </Box>
        </Box>
      ))}

      <Button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        sx={{
          mt: 1, borderRadius: "50px", px: 5, py: 1.3,
          background: "#2979ff", color: "#fff",
          fontWeight: 700, fontSize: "0.95rem",
          textTransform: "none",
          boxShadow: "0 4px 20px rgba(41,121,255,0.4)",
          "&:hover": { background: "#1565c0" },
        }}
      >
        {t("guide_got_it")}
      </Button>
      <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", mt: -1 }}>
        {t("guide_tap_close")}
      </Typography>
    </Box>
  );
}

// Utilities Panel

interface UtilitiesPanelProps {
  open: boolean;
  onClose: () => void;
}

function UtilitiesPanel({ open, onClose }: UtilitiesPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const touchStart = useRef<{ x: number; y: number; inScroll: boolean } | null>(null);
  const [tab, setTab] = useState<"battlefield" | "ornn" | "runes" | "rules">("battlefield");

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    // Detect if the gesture started inside a vertically scrollable list so we
    // don't treat a scroll-up as a swipe-to-close.
    let el: HTMLElement | null = e.target as HTMLElement;
    let inScroll = false;
    while (el && el !== e.currentTarget) {
      if (el.scrollHeight > el.clientHeight) {
        const overflowY = window.getComputedStyle(el).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          inScroll = true;
          break;
        }
      }
      el = el.parentElement;
    }
    touchStart.current = { x: t.clientX, y: t.clientY, inScroll };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const inScroll = touchStart.current.inScroll;
    touchStart.current = null;
    // Horizontal swipe → cycle calculators (wraps around)
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const order = ["battlefield", "ornn", "runes", "rules"] as const;
      setTab((prev) => {
        const i = order.indexOf(prev);
        const next = dx < 0 ? (i + 1) % order.length : (i - 1 + order.length) % order.length;
        return order[next];
      });
      return;
    }
    // Swipe down to close (ignored when scrolling a list)
    if (!inScroll && dy > 70 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      onClose();
    }
  }

  return (
    <Box
      className={`rb-utilities-panel${open ? " rb-utilities-panel--open" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      sx={{
        background: isDark ? "#0a0a1a" : "#f4f4f8",
        color: isDark ? "#fff" : "#111",
      }}
    >
      {/* Header */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        py: 1.8,
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)"}`,
        flexShrink: 0,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TuneIcon sx={{ fontSize: 18, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }} />
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: 0.2 }}>{t("utilities")}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "10px", p: 0.8 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Section: Might Calculator */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", px: 2, pt: 2, pb: 1 }}>
        {/* Calculator title + swipe indicator */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: isDark ? "#fff" : "#111", letterSpacing: 0.2 }}>
            {tab === "battlefield" ? t("battlefield_might") : tab === "ornn" ? t("ornn_calculator") : tab === "runes" ? t("runes_title") : t("rules_hub")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
            {(["battlefield", "ornn", "runes", "rules"] as const).map((k) => {
              const active = tab === k;
              return (
                <Box
                  key={k}
                  onClick={() => setTab(k)}
                  sx={{
                    width: active ? 20 : 7,
                    height: 7,
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: active ? "linear-gradient(135deg, #2979ff 0%, #5c35d4 100%)" : (isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)"),
                  }}
                />
              );
            })}
          </Box>
        </Box>
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {open && (tab === "battlefield" ? <MightCalculator /> : tab === "ornn" ? <OrnnCalculator /> : tab === "runes" ? <RunesCalculator /> : <RulesCarousel />)}
        </Box>
      </Box>

      {/* Swipe-up hint */}
      <Box sx={{ flexShrink: 0, display: "flex", justifyContent: "center", pb: 2, pt: 1 }}>
        <Box sx={{
          width: 36,
          height: 4,
          borderRadius: 4,
          background: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)",
        }} />
      </Box>
    </Box>
  );
}

// Game View

interface GameViewProps {
  players: Player[];
  mode: GameMode;
  maxPoints: number;
  useXp: boolean;
  timer: number;
  timerRunning: boolean;
  tossOpen: boolean;
  tossMsg: string;
  log: LogEntry[];
  logOpen: boolean;
  onChangeScore: (id: string, delta: number) => void;
  onChangeXp: (id: string, delta: number) => void;
  onLogAction: (id: string, action: LogAction) => void;
  onToggleTimer: () => void;
  onReset: () => void;
  onToss: () => void;
  onCloseToss: () => void;
  onBack: () => void;
  onOpenLog: () => void;
  onCloseLog: () => void;
  onResetTimer: () => void;
  starterHighlightId: string | null;
  starterSpinning: boolean;
  onStarterSpin: () => void;
  utilitiesMode: UtilitiesMode;
  backRequestRef?: { current: (() => void) | null };
}

function GameView({ players, mode, maxPoints, useXp, timer, timerRunning, tossOpen, tossMsg, log, logOpen, onChangeScore, onChangeXp, onLogAction, onToggleTimer, onReset, onCloseToss, onBack, onOpenLog, onCloseLog, onResetTimer, starterHighlightId, starterSpinning, onStarterSpin, utilitiesMode, backRequestRef }: GameViewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(() => !localStorage.getItem("rb-guide-seen"));
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const resetHoldRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetLongPressed = useRef(false);
  const [confirmBackOpen, setConfirmBackOpen] = useState(false);

  useScreenWakeLock(true);
  const { dimmed, markActive } = useIdleDim(true, IDLE_DIM_MS);

  function handleBackClick() {
    if (players.some((p) => p.score > 0 || p.xp > 0)) {
      setConfirmBackOpen(true);
    } else {
      onBack();
    }
  }

  // Expose the back handler so the hardware back button can reuse it.
  useEffect(() => {
    if (backRequestRef) backRequestRef.current = handleBackClick;
    return () => { if (backRequestRef) backRequestRef.current = null; };
  });

  function startResetHold() {
    resetLongPressed.current = false;
    resetHoldRef.current = setTimeout(() => {
      resetLongPressed.current = true;
      tryVibrate(40);
      onResetTimer();
    }, 600);
  }

  function endResetHold() {
    if (resetHoldRef.current) {
      clearTimeout(resetHoldRef.current);
      resetHoldRef.current = null;
    }
  }

  function handleResetClick() {
    if (resetLongPressed.current) {
      resetLongPressed.current = false;
      return;
    }
    onReset();
  }

  function dismissGuide() {
    localStorage.setItem("rb-guide-seen", "1");
    setGuideOpen(false);
  }

  function handleTouchStart(e: React.TouchEvent) {
    markActive();
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!swipeStart.current || utilitiesOpen) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeStart.current.x;
    const dy = t.clientY - swipeStart.current.y;
    swipeStart.current = null;
    // Horizontal swipe → open utilities (only in gesture mode)
    if (utilitiesMode === "gesture" && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setUtilitiesOpen(true);
    }
  }

  const panel = (p: Player, flipped: boolean) => (
    <PlayerPanel key={p.id} player={p} flipped={flipped} highlighted={starterHighlightId === p.id} maxPoints={maxPoints} useXp={useXp} hideActions={mode !== "2p"} onChangeScore={onChangeScore} onChangeXp={onChangeXp} onLogAction={onLogAction} />
  );

  const middleBar = (
    <Box className="rb-middle-bar">
      <Button
        size="small"
        onClick={handleBackClick}
        startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
        sx={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)", fontSize: "0.7rem", textTransform: "none", fontWeight: 700, minWidth: 0, px: 1 }}
      >
        {t("menu")}
      </Button>
      <Button
        className="rb-timer-pill"
        onClick={onToggleTimer}
        startIcon={timerRunning ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
      >
        {formatTime(timer)}
      </Button>
      <Box sx={{ flex: 1 }} />
      {utilitiesMode === "button" && (
        <IconButton className="rb-bar-icon-btn" onClick={() => setUtilitiesOpen(true)} size="small" title={t("open_utilities")}>
          <TuneIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
        </IconButton>
      )}
      <IconButton className="rb-bar-icon-btn" onClick={onStarterSpin} size="small" title={t("pick_starting_player")} disabled={starterSpinning}>
        <CasinoIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
      </IconButton>
      <IconButton className="rb-bar-icon-btn" onClick={onOpenLog} size="small" title={t("game_log")}>
        <HistoryIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
      </IconButton>
      <IconButton className="rb-bar-icon-btn" onClick={() => setGuideOpen(true)} size="small" title={t("how_to_play")}>
        <HelpOutlineIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
      </IconButton>
      <IconButton
        className="rb-bar-icon-btn"
        onClick={handleResetClick}
        onPointerDown={startResetHold}
        onPointerUp={endResetHold}
        onPointerLeave={endResetHold}
        size="small"
        title={t("restart_scores")}
      >
        <RefreshIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
      </IconButton>
    </Box>
  );

  return (
    <Box className="rb-game-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} sx={{
      '--rb-bg': isDark ? '#08080f' : '#f4f4f8',
      '--rb-text': isDark ? '#ffffff' : '#111111',
      '--rb-text-muted': isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
      '--rb-icon-color': isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)',
      '--rb-badge-bg': isDark ? 'rgba(10,10,30,0.85)' : 'rgba(255,255,255,0.92)',
      '--rb-badge-border': isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)',
      '--rb-score-btn-bg': isDark ? 'rgba(18,18,45,0.92)' : 'rgba(240,240,250,0.95)',
      '--rb-score-btn-border': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
      '--rb-score-btn-color': isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
      '--rb-bar-bg': isDark ? '#0c0c1e' : '#ebebf5',
      '--rb-bar-border': isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)',
      '--rb-pill-bg': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
      '--rb-pill-color': isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
      '--rb-panel-divider': isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      '--rb-xp-bg': isDark ? 'rgba(4,4,18,0.94)' : 'rgba(255,255,255,0.96)',
      '--rb-xp-border': isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
    } as React.CSSProperties}>
      {mode === "2p" && <>{panel(players[1], true)}{middleBar}{panel(players[0], false)}</>}
      {mode === "3p" && (
        <>
          <Box className="rb-panel-row">{panel(players[1], true)}{panel(players[2], true)}</Box>
          {middleBar}
          {panel(players[0], false)}
        </>
      )}
      {mode === "4p" && (
        <>
          <Box className="rb-panel-row">{panel(players[2], true)}{panel(players[3], true)}</Box>
          {middleBar}
          <Box className="rb-panel-row">{panel(players[0], false)}{panel(players[1], false)}</Box>
        </>
      )}
      <Snackbar
        open={tossOpen}
        autoHideDuration={3000}
        onClose={onCloseToss}
        message={tossMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ "& .MuiSnackbarContent-root": { fontSize: "1.1rem", fontWeight: 700 } }}
      />

      <Dialog
        open={confirmBackOpen}
        onClose={() => setConfirmBackOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: {
          sx: {
            background: isDark ? "#0f0f22" : "#f4f4f8",
            borderRadius: 3,
            m: 2,
          },
        } }}
      >
        <DialogTitle sx={{ color: isDark ? "#fff" : "#111", fontWeight: 700, pb: 1 }}>
          {t("confirm_leave_title")}
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography sx={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", fontSize: "0.9rem" }}>
            {t("confirm_leave_msg")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmBackOpen(false)}
            sx={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)", textTransform: "none", fontWeight: 700 }}
          >
            {t("confirm_leave_stay")}
          </Button>
          <Button
            onClick={() => { setConfirmBackOpen(false); onBack(); }}
            sx={{ color: "#ef5350", textTransform: "none", fontWeight: 800 }}
          >
            {t("confirm_leave_confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={logOpen}
        onClose={onCloseLog}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: {
          sx: {
            background: isDark ? "#0f0f22" : "#f4f4f8",
            borderRadius: 3,
            m: 2,
            maxHeight: "75vh",
          },
        } }}
      >
        <DialogTitle sx={{ color: isDark ? "#fff" : "#111", fontWeight: 700, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {t("game_log")}
          <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontWeight: 400 }}>
            {log.length} {log.length === 1 ? t("action_one") : t("action_many")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, px: 2, pb: 2 }}>
          {log.length === 0 ? (
            <Typography sx={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", fontSize: "0.88rem", textAlign: "center", py: 3 }}>
              {t("no_actions")}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {[...log].reverse().map((entry) => (
                <Box
                  key={entry.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    py: 0.9,
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: entry.playerColor, flexShrink: 0 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: isDark ? "#fff" : "#111", flex: 1 }}>
                    {entry.playerName}
                  </Typography>
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: entry.action === "Conquer" ? "#ff6d3a" : entry.action === "Hold" ? "#2f7bff" : entry.action === "Ability" ? "#a44bff" : entry.action === "+1" ? "#4caf50" : entry.action === "-1" ? "#ef5350" : "#2979ff",
                    minWidth: 60,
                    textAlign: "right",
                  }}>
                    {entry.action}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", minWidth: 44, textAlign: "right" }}>
                    {entry.score}pts
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.3)", minWidth: 36, textAlign: "right" }}>
                    {formatTime(entry.gameTime)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <UtilitiesPanel open={utilitiesOpen} onClose={() => setUtilitiesOpen(false)} />
      {guideOpen && <HowToGuide onDismiss={dismissGuide} />}

      {/* Idle dim overlay — lowers brightness after inactivity to save battery. */}
      <Box
        onTouchStart={(e) => { if (dimmed) { e.stopPropagation(); markActive(); } }}
        onClick={() => { if (dimmed) markActive(); }}
        sx={{
          position: "fixed", inset: 0, zIndex: 1600,
          background: "#000",
          opacity: dimmed ? (Capacitor.isNativePlatform() ? 0.25 : 0.6) : 0,
          transition: "opacity 0.9s ease",
          pointerEvents: dimmed ? "auto" : "none",
        }}
      />
    </Box>
  );
}

// Config Screen

interface ConfigScreenProps {
  utilitiesMode: UtilitiesMode;
  onChangeUtilitiesMode: (m: UtilitiesMode) => void;
  lang: Lang;
  onChangeLang: (l: Lang) => void;
  onBack: () => void;
}

function ConfigScreen({ utilitiesMode, onChangeUtilitiesMode, lang, onChangeLang, onBack }: ConfigScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();

  const surface = isDark ? "#0f0f22" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)";

  return (
    <Box sx={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      background: isDark ? "#08080f" : "#f4f4f8",
      color: isDark ? "#fff" : "#111",
      pt: "env(safe-area-inset-top)",
      pb: "env(safe-area-inset-bottom)",
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.5, borderBottom: `1px solid ${border}` }}>
        <IconButton size="small" onClick={onBack} sx={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: -0.2 }}>{t("configuration")}</Typography>
      </Box>

      <Box sx={{ px: 2, pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Section label */}
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)" }}>
          {t("config_game_screen")}
        </Typography>

        {/* Utilities option */}
        <Box sx={{ background: surface, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
          <Typography sx={{ px: 2, pt: 1.5, pb: 1, fontSize: "1rem", fontWeight: 700 }}>
            {t("open_utilities")}
          </Typography>
          <Typography sx={{ px: 2, pb: 1.5, fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
            {t("config_open_utilities_desc")}
          </Typography>

          {/* Option: Gesture */}
          <Box
            onClick={() => onChangeUtilitiesMode("gesture")}
            sx={{
              display: "flex", alignItems: "center", gap: 2,
              px: 2, py: 1.5,
              borderTop: `1px solid ${border}`,
              cursor: "pointer",
              background: utilitiesMode === "gesture" ? (isDark ? "rgba(41,121,255,0.10)" : "rgba(41,121,255,0.06)") : "transparent",
              transition: "background 0.15s",
            }}
          >
            <Box sx={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${utilitiesMode === "gesture" ? "#2979ff" : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)")}`,
              background: utilitiesMode === "gesture" ? "#2979ff" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {utilitiesMode === "gesture" && <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{t("gesture")}</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
                {t("gesture_desc")}
              </Typography>
            </Box>
          </Box>

          {/* Option: Button */}
          <Box
            onClick={() => onChangeUtilitiesMode("button")}
            sx={{
              display: "flex", alignItems: "center", gap: 2,
              px: 2, py: 1.5,
              borderTop: `1px solid ${border}`,
              cursor: "pointer",
              background: utilitiesMode === "button" ? (isDark ? "rgba(41,121,255,0.10)" : "rgba(41,121,255,0.06)") : "transparent",
              transition: "background 0.15s",
            }}
          >
            <Box sx={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${utilitiesMode === "button" ? "#2979ff" : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)")}`,
              background: utilitiesMode === "button" ? "#2979ff" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {utilitiesMode === "button" && <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{t("button")}</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
                {t("button_desc")}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Language section */}
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)", mt: 1 }}>
          {t("language")}
        </Typography>

        <Box sx={{ background: surface, border: `1px solid ${border}`, borderRadius: "14px", overflow: "hidden" }}>
          <Typography sx={{ px: 2, pt: 1.5, pb: 1.5, fontSize: "0.82rem", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)" }}>
            {t("language_desc")}
          </Typography>
          <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${border}`, pt: 2 }}>
            <Select
              fullWidth
              value={lang}
              onChange={(e) => onChangeLang(e.target.value as Lang)}
              MenuProps={{ slotProps: { paper: { sx: { background: surface, color: isDark ? "#fff" : "#111", border: `1px solid ${border}` } } } }}
              sx={{
                borderRadius: "10px",
                color: isDark ? "#fff" : "#111",
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                fontWeight: 700,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: border },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2979ff" },
                "& .MuiSvgIcon-root": { color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)" },
              }}
            >
              {LANGUAGES.map((l) => (
                <MenuItem key={l.code} value={l.code} sx={{ fontWeight: 600 }}>{l.label}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// Home Screen

function HomeScreen({ onMultiplayer, onSolo, onConfig, onRules, onTrading }: { onMultiplayer: () => void; onSolo: () => void; onConfig: () => void; onRules: () => void; onTrading: () => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  return (
    <Box sx={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: isDark ? "#08080f" : "#f4f4f8",
      gap: 3, px: 3,
      pt: "env(safe-area-inset-top)",
      pb: "env(safe-area-inset-bottom)",
    }}>
      {/* Support us — external link */}
      <Button
        onClick={() => window.open("https://buymeacoffee.com/sonsofthemoon", "_blank")}
        startIcon={<LocalCafeIcon sx={{ fontSize: 16 }} />}
        sx={{
          position: "absolute", top: "calc(env(safe-area-inset-top) + 12px)", right: 12,
          borderRadius: "50px", px: 1.5, py: 0.6, minWidth: 0,
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}`,
          color: "#ffb300", fontSize: "0.72rem", fontWeight: 700, textTransform: "none", letterSpacing: 0.2,
          "&:hover": { background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)" },
        }}
      >
        {t("support_us")}
      </Button>

      {/* Logo / title */}
      <Box sx={{ textAlign: "center", mb: 3, position: "relative" }}>
        {/* Glow blob behind title */}
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(41,121,255,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <Box
          component="img"
          src={logoUrl}
          alt="RiftMate"
          sx={{
            width: "clamp(84px, 26vw, 112px)", height: "auto", display: "block", mx: "auto", mb: 1.5,
            borderRadius: "22px",
            boxShadow: isDark ? "0 8px 30px rgba(41,121,255,0.45)" : "0 8px 24px rgba(0,0,0,0.2)",
          }}
        />
        <Typography sx={{
          fontSize: "clamp(2.2rem, 9vw, 3.2rem)", fontWeight: 900,
          color: isDark ? "#fff" : "#111", letterSpacing: -1.5, lineHeight: 1,
          textShadow: isDark ? "0 2px 30px rgba(41,121,255,0.3)" : "none",
        }}>
          RiftMate
        </Typography>
        <Typography sx={{
          fontSize: "clamp(0.7rem, 2.8vw, 0.85rem)", fontWeight: 700,
          color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
          letterSpacing: 4, textTransform: "uppercase", mt: 0.75,
        }}>
          {t("home_subtitle")}
        </Typography>
      </Box>

      {/* Multiplayer */}
      <Button
        fullWidth
        onClick={onMultiplayer}
        sx={{
          maxWidth: 360, borderRadius: "20px", py: 2.5,
          background: "linear-gradient(135deg, #2979ff 0%, #5c35d4 100%)",
          color: "#fff", fontSize: "1.1rem", fontWeight: 800,
          textTransform: "none", letterSpacing: 0.2,
          boxShadow: "0 8px 32px rgba(41,121,255,0.5)",
          transition: "box-shadow 0.2s, transform 0.1s",
          "&:hover": { boxShadow: "0 10px 36px rgba(41,121,255,0.6)", transform: "translateY(-1px)" },
          "&:active": { transform: "scale(0.97)" },
          display: "flex", flexDirection: "column", gap: 0.3,
        }}
      >
        <span>{t("home_multiplayer")}</span>
        <Typography component="span" sx={{ fontSize: "0.7rem", fontWeight: 500, opacity: 0.75, lineHeight: 1 }}>
          {t("home_multiplayer_sub")}
        </Typography>
      </Button>

      {/* Solo */}
      <Button
        fullWidth
        onClick={onSolo}
        sx={{
          maxWidth: 360, borderRadius: "20px", py: 2.5,
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1.5px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}`,
          color: isDark ? "#fff" : "#111", fontSize: "1.1rem", fontWeight: 800,
          textTransform: "none", letterSpacing: 0.2,
          transition: "background 0.15s, transform 0.1s",
          "&:hover": { background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)" },
          "&:active": { transform: "scale(0.97)" },
          display: "flex", flexDirection: "column", gap: 0.3,
        }}
      >
        <span>{t("home_solo")}</span>
        <Typography component="span" sx={{ fontSize: "0.7rem", fontWeight: 500, opacity: 0.5, lineHeight: 1 }}>
          {t("home_solo_sub")}
        </Typography>
      </Button>

      {/* Rules */}
      <Button
        fullWidth
        onClick={onRules}
        startIcon={<MenuBookIcon sx={{ fontSize: 22 }} />}
        sx={{
          maxWidth: 360, borderRadius: "20px", py: 2.5,
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1.5px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}`,
          color: isDark ? "#fff" : "#111", fontSize: "1.1rem", fontWeight: 800,
          textTransform: "none", letterSpacing: 0.2,
          transition: "background 0.15s, transform 0.1s",
          "&:hover": { background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)" },
          "&:active": { transform: "scale(0.97)" },
          display: "flex", flexDirection: "column", gap: 0.3,
        }}
      >
        <span>{t("home_rules")}</span>
        <Typography component="span" sx={{ fontSize: "0.7rem", fontWeight: 500, opacity: 0.5, lineHeight: 1 }}>
          {t("home_rules_sub")}
        </Typography>
      </Button>

      {/* Trading */}
      <Button
        fullWidth
        onClick={onTrading}
        startIcon={<SwapVertIcon sx={{ fontSize: 22 }} />}
        sx={{
          maxWidth: 360, borderRadius: "20px", py: 2.5,
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1.5px solid ${isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}`,
          color: isDark ? "#fff" : "#111", fontSize: "1.1rem", fontWeight: 800,
          textTransform: "none", letterSpacing: 0.2,
          transition: "background 0.15s, transform 0.1s",
          "&:hover": { background: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)" },
          "&:active": { transform: "scale(0.97)" },
          display: "flex", flexDirection: "column", gap: 0.3,
        }}
      >
        <span>{t("home_trading")}</span>
        <Typography component="span" sx={{ fontSize: "0.7rem", fontWeight: 500, opacity: 0.5, lineHeight: 1 }}>
          {t("home_trading_sub")}
        </Typography>
      </Button>

      {/* Config */}
      <Button
        onClick={onConfig}
        startIcon={<SettingsIcon sx={{ fontSize: 17 }} />}
        sx={{
          mt: 1.5, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)",
          fontSize: "0.82rem", fontWeight: 600, textTransform: "none", letterSpacing: 0.2,
          "&:hover": { color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" },
        }}
      >
        {t("configuration")}
      </Button>
    </Box>
  );
}

// Rules Hub

interface RuleEntry {
  num: string;
  text: string;
  depth: number;
}
interface RuleSection {
  id: string;
  title: string;
  rules: RuleEntry[];
}
interface ErrataCard {
  name: string;
  new: string;
  old: string;
}
interface ErrataGroup {
  set: string;
  cards: ErrataCard[];
}
interface BanGroup {
  category: string;
  items: string[];
}
interface BanList {
  note: string;
  groups: BanGroup[];
}
interface RulesData {
  lastUpdated: string;
  sections: RuleSection[];
  errata: ErrataGroup[];
  banList: BanList | unknown[];
  tournamentRules: RuleSection[];
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let idx = lower.indexOf(q);
  let key = 0;
  while (idx !== -1) {
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <Box key={key++} component="span" sx={{ background: "rgba(255,193,7,0.35)", borderRadius: "3px", px: "2px" }}>
        {text.slice(idx, idx + q.length)}
      </Box>
    );
    i = idx + q.length;
    idx = lower.indexOf(q, i);
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts;
}

function useRulesData() {
  const [data, setData] = useState<RulesData | null>(null);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`${import.meta.env.BASE_URL}rules/rules.json`)
      .then((r) => r.json())
      .then((json: RulesData) => { if (alive) setData(json); })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, []);
  return { data, loadError };
}

function RuleRow({ entry, isDark, highlight = "" }: { entry: RuleEntry; isDark: boolean; highlight?: string }) {
  return (
    <Box sx={{ display: "flex", gap: 1, py: 0.7, pl: `${entry.depth * 14}px` }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#2979ff", minWidth: 52, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        {entry.num}
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", lineHeight: 1.45, color: isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.78)" }}>
        {highlight ? highlightMatch(entry.text, highlight) : entry.text}
      </Typography>
    </Box>
  );
}

function ErrataCardRow({ card, isDark, highlight = "" }: { card: ErrataCard; isDark: boolean; highlight?: string }) {
  const t = useT();
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";
  const block = (labelKey: string, text: string, accent: string, bg: string) => (
    <Box sx={{ mt: 0.75 }}>
      <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: accent }}>
        {t(labelKey)}
      </Typography>
      <Typography sx={{ fontSize: "0.82rem", lineHeight: 1.45, color: isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.78)", background: bg, borderRadius: "8px", px: 1, py: 0.6, mt: 0.3 }}>
        {highlight ? highlightMatch(text, highlight) : text}
      </Typography>
    </Box>
  );
  return (
    <Box sx={{ py: 1, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
      <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: isDark ? "#fff" : "#111" }}>
        {highlight ? highlightMatch(card.name, highlight) : card.name}
      </Typography>
      {block("errata_new", card.new, "#4caf50", isDark ? "rgba(76,175,80,0.10)" : "rgba(76,175,80,0.08)")}
      {block("errata_old", card.old, textMuted, isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)")}
    </Box>
  );
}

function RulesView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const { data, loadError } = useRulesData();
  const [tab, setTab] = useState<"core" | "tournament">("core");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<null | "errata" | "ban">(null);
  const [errataExpanded, setErrataExpanded] = useState<string | null>(null);
  const [errataSearch, setErrataSearch] = useState("");

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";

  const sections = data ? (tab === "core" ? data.sections : data.tournamentRules) : [];
  const query = search.trim().toLowerCase();

  const searchResults = query
    ? sections.flatMap((s) =>
        s.rules
          .filter((r) => r.text.toLowerCase().includes(query) || r.num.toLowerCase().includes(query))
          .map((r) => ({ rule: r, section: s }))
      ).slice(0, 200)
    : [];

  const header = (
    <Box sx={{ display: "flex", alignItems: "center", px: 1, pt: "calc(env(safe-area-inset-top) + 8px)", pb: 1 }}>
      <IconButton onClick={detail ? () => setDetail(null) : onBack} sx={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}>
        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <Typography sx={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: "1.1rem", color: isDark ? "#fff" : "#111", mr: 5 }}>
        {detail === "errata" ? t("card_errata") : detail === "ban" ? t("ban_list") : t("rules_hub")}
      </Typography>
    </Box>
  );

  const containerSx = {
    position: "fixed" as const, inset: 0,
    background: isDark ? "#08080f" : "#f4f4f8",
    color: isDark ? "#fff" : "#111",
    display: "flex", flexDirection: "column" as const,
    pb: "env(safe-area-inset-bottom)",
  };

  // Errata / Ban List detail
  if (detail === "errata") {
    const q = errataSearch.trim().toLowerCase();
    const groups = (data?.errata ?? [])
      .map((g) => ({
        set: g.set,
        cards: q
          ? g.cards.filter((c) => c.name.toLowerCase().includes(q) || c.new.toLowerCase().includes(q) || c.old.toLowerCase().includes(q))
          : g.cards,
      }))
      .filter((g) => g.cards.length > 0);
    return (
      <Box sx={containerSx}>
        {header}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 4 }}>
          <TextField
            fullWidth
            size="small"
            value={errataSearch}
            onChange={(e) => setErrataSearch(e.target.value)}
            placeholder={t("rules_search")}
            sx={{ mt: 0.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: textMuted }} />
                  </InputAdornment>
                ),
                endAdornment: errataSearch ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setErrataSearch("")} sx={{ color: textMuted }}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
                sx: { borderRadius: "999px", background: cardBg, fontSize: "0.9rem" },
              },
            }}
          />
          {!data && !loadError && (
            <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>{t("rules_loading")}</Typography>
          )}
          {data && groups.length === 0 && (
            <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>
              {q ? t("rules_no_results") : t("rules_coming_soon")}
            </Typography>
          )}
          {groups.map((g) => {
            const open = q ? true : errataExpanded === g.set;
            return (
              <Box key={g.set} sx={{ borderBottom: `1px solid ${cardBorder}` }}>
                <Box
                  onClick={() => { if (!q) setErrataExpanded(open ? null : g.set); }}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2, cursor: q ? "default" : "pointer" }}
                >
                  <Typography sx={{ flex: 1, fontWeight: 800, fontSize: "1.05rem", color: isDark ? "#fff" : "#111" }}>
                    {g.set}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: textMuted }}>{g.cards.length}</Typography>
                  {!q && <ChevronRightIcon sx={{ color: textMuted, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />}
                </Box>
                {open && (
                  <Box sx={{ pb: 1.5 }}>
                    {g.cards.map((c) => <ErrataCardRow key={c.name} card={c} isDark={isDark} highlight={errataSearch.trim()} />)}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  if (detail) {
    const banList = data && !Array.isArray(data.banList) ? (data.banList as BanList) : null;
    return (
      <Box sx={containerSx}>
        {header}
        {banList && banList.groups.length > 0 ? (
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 1, mb: 1.5 }}>
              <BlockIcon sx={{ fontSize: 20, color: "#e53935", flexShrink: 0, mt: 0.2 }} />
              <Typography sx={{ fontSize: "0.9rem", color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)" }}>
                {t("ban_list_note")}
              </Typography>
            </Box>
            {banList.groups.map((g) => (
              <Box key={g.category} sx={{ mt: 1.5, borderRadius: "14px", background: cardBg, border: `1px solid ${cardBorder}`, px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: isDark ? "#fff" : "#111", mb: 0.5 }}>
                  {g.category}
                </Typography>
                {g.items.map((item) => (
                  <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6 }}>
                    <BlockIcon sx={{ fontSize: 15, color: "#e53935", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.9rem", color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)" }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5, px: 4, textAlign: "center" }}>
            <BlockIcon sx={{ fontSize: 44, color: textMuted }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>{t("ban_list")}</Typography>
            <Typography sx={{ color: textMuted, fontSize: "0.88rem" }}>{data ? t("rules_coming_soon") : t("rules_loading")}</Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={containerSx}>
      {header}
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 4 }}>
        {/* Errata + Ban cards */}
        {[
          { key: "errata" as const, icon: <EditNoteIcon sx={{ fontSize: 22 }} />, label: t("card_errata"), sub: t("card_errata_sub") },
          { key: "ban" as const, icon: <BlockIcon sx={{ fontSize: 22 }} />, label: t("ban_list"), sub: t("ban_list_sub") },
        ].map((c) => (
          <Box
            key={c.key}
            onClick={() => setDetail(c.key)}
            sx={{
              display: "flex", alignItems: "center", gap: 1.5, mt: 1.5, px: 2, py: 1.75,
              borderRadius: "14px", background: cardBg, border: `1px solid ${cardBorder}`,
              cursor: "pointer", "&:active": { transform: "scale(0.99)" },
            }}
          >
            <Box sx={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)" }}>{c.icon}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>{c.label}</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: textMuted }}>{c.sub}</Typography>
            </Box>
            <ChevronRightIcon sx={{ color: textMuted }} />
          </Box>
        ))}

        {/* Core / Tournament toggle */}
        <Box sx={{ display: "flex", mt: 2.5, p: 0.4, borderRadius: "12px", background: cardBg, border: `1px solid ${cardBorder}` }}>
          {(["core", "tournament"] as const).map((key) => (
            <Button
              key={key}
              onClick={() => { setTab(key); setExpanded(null); }}
              sx={{
                flex: 1, borderRadius: "9px", py: 1, textTransform: "none", fontWeight: 800, fontSize: "0.9rem",
                background: tab === key ? "#2979ff" : "transparent",
                color: tab === key ? "#fff" : textMuted,
                "&:hover": { background: tab === key ? "#2979ff" : "transparent" },
              }}
            >
              {key === "core" ? t("core_rules") : t("tournament_rules")}
            </Button>
          ))}
        </Box>

        {data && (
          <Typography sx={{ textAlign: "center", color: textMuted, fontSize: "0.8rem", mt: 1.25 }}>
            {t("rules_last_updated").replace("{date}", data.lastUpdated)}
          </Typography>
        )}

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("rules_search")}
          sx={{ mt: 1.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: textMuted }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")} sx={{ color: textMuted }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
              sx: { borderRadius: "999px", background: cardBg, fontSize: "0.9rem" },
            },
          }}
        />

        {/* Loading / error / empty states */}
        {!data && !loadError && (
          <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>{t("rules_loading")}</Typography>
        )}
        {loadError && (
          <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>{t("rules_coming_soon")}</Typography>
        )}
        {data && tab === "tournament" && sections.length === 0 && (
          <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>{t("rules_coming_soon")}</Typography>
        )}

        {/* Search results */}
        {data && query && (
          searchResults.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>{t("rules_no_results")}</Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {searchResults.map(({ rule, section }) => (
                <Box key={`${section.id}-${rule.num}`} sx={{ borderBottom: `1px solid ${cardBorder}`, pb: 0.4 }}>
                  <Typography sx={{ fontSize: "0.68rem", color: textMuted, mt: 0.8 }}>
                    {t("rules_results_in").replace("{section}", `${section.id} · ${section.title}`)}
                  </Typography>
                  <RuleRow entry={rule} isDark={isDark} highlight={search.trim()} />
                </Box>
              ))}
            </Box>
          )
        )}

        {/* Section list (accordion) */}
        {data && !query && sections.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {sections.map((s) => {
              const open = expanded === s.id;
              return (
                <Box key={s.id} sx={{ borderBottom: `1px solid ${cardBorder}` }}>
                  <Box
                    onClick={() => setExpanded(open ? null : s.id)}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2, cursor: "pointer" }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: isDark ? "#fff" : "#111", minWidth: 46 }}>
                      {s.id}.
                    </Typography>
                    <Typography sx={{ flex: 1, fontWeight: 800, fontSize: "1.05rem", color: isDark ? "#fff" : "#111" }}>
                      {s.title}
                    </Typography>
                    <ChevronRightIcon sx={{ color: textMuted, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                  </Box>
                  {open && (
                    <Box sx={{ pb: 2 }}>
                      {s.rules.map((r) => <RuleRow key={r.num} entry={r} isDark={isDark} />)}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Compact rules browser for the utilities carousel

function RulesCarousel() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const { data, loadError } = useRulesData();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";

  const sections = data?.sections ?? [];
  const query = search.trim().toLowerCase();
  const searchResults = query
    ? sections.flatMap((s) =>
        s.rules
          .filter((r) => r.text.toLowerCase().includes(query) || r.num.toLowerCase().includes(query))
          .map((r) => ({ rule: r, section: s }))
      ).slice(0, 200)
    : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("rules_search")}
        sx={{ flexShrink: 0 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: textMuted }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")} sx={{ color: textMuted }}>
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ) : undefined,
            sx: { borderRadius: "999px", background: cardBg, fontSize: "0.9rem" },
          },
        }}
      />

      <Box sx={{ flex: 1, overflowY: "auto", mt: 1.25, pb: 1 }}>
        {!data && !loadError && (
          <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>{t("rules_loading")}</Typography>
        )}
        {loadError && (
          <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>{t("rules_coming_soon")}</Typography>
        )}

        {/* Search results */}
        {data && query && (
          searchResults.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: textMuted, mt: 4, fontSize: "0.9rem" }}>{t("rules_no_results")}</Typography>
          ) : (
            <Box>
              {searchResults.map(({ rule, section }) => (
                <Box key={`${section.id}-${rule.num}`} sx={{ borderBottom: `1px solid ${cardBorder}`, pb: 0.4 }}>
                  <Typography sx={{ fontSize: "0.68rem", color: textMuted, mt: 0.8 }}>
                    {t("rules_results_in").replace("{section}", `${section.id} · ${section.title}`)}
                  </Typography>
                  <RuleRow entry={rule} isDark={isDark} highlight={search.trim()} />
                </Box>
              ))}
            </Box>
          )
        )}

        {/* Section list (accordion) */}
        {data && !query && (
          <Box>
            {sections.map((s) => {
              const open = expanded === s.id;
              return (
                <Box key={s.id} sx={{ borderBottom: `1px solid ${cardBorder}` }}>
                  <Box
                    onClick={() => setExpanded(open ? null : s.id)}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.75, cursor: "pointer" }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: "0.98rem", color: isDark ? "#fff" : "#111", minWidth: 46 }}>
                      {s.id}.
                    </Typography>
                    <Typography sx={{ flex: 1, fontWeight: 800, fontSize: "0.98rem", color: isDark ? "#fff" : "#111" }}>
                      {s.title}
                    </Typography>
                    <ChevronRightIcon sx={{ color: textMuted, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }} />
                  </Box>
                  {open && (
                    <Box sx={{ pb: 2 }}>
                      {s.rules.map((r) => <RuleRow key={r.num} entry={r} isDark={isDark} />)}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Solo View

function SoloView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [legendId, setLegendId] = useState<string | null>(null);
  const [legendPickerOpen, setLegendPickerOpen] = useState(false);

  useScreenWakeLock(true);
  const { dimmed, markActive } = useIdleDim(true, IDLE_DIM_MS);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Pause timer when app goes to background
  useEffect(() => {
    function onVisChange() { if (document.hidden) setTimerRunning(false); }
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, []);

  function reset() {
    setScore(0);
    setTimer(0);
    setTimerRunning(false);
  }

  const cssVars = {
    '--rb-bg': isDark ? '#08080f' : '#f4f4f8',
    '--rb-text': isDark ? '#ffffff' : '#111111',
    '--rb-badge-bg': isDark ? 'rgba(10,10,30,0.85)' : 'rgba(255,255,255,0.92)',
    '--rb-badge-border': isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)',
    '--rb-score-btn-bg': isDark ? 'rgba(18,18,45,0.92)' : 'rgba(240,240,250,0.95)',
    '--rb-score-btn-border': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
    '--rb-score-btn-color': isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
    '--rb-bar-bg': isDark ? '#0c0c1e' : '#ebebf5',
    '--rb-bar-border': isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)',
    '--rb-pill-bg': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    '--rb-pill-color': isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
  } as React.CSSProperties;

  return (
    <Box onTouchStart={() => markActive()} sx={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "var(--rb-bg)", overflow: "hidden",
      pt: "env(safe-area-inset-top)", pb: "env(safe-area-inset-bottom)", ...cssVars }}>
      {/* Legend background */}
      {legendId && (
        <Box sx={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `url(${getLegendUrl(legendId)})`,
          backgroundSize: "cover", backgroundPosition: "center top",
          opacity: isDark ? 0.18 : 0.14,
        }} />
      )}

      {/* Score area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, position: "relative", zIndex: 1 }}>
        <IconButton
          className="rb-score-btn"
          onClick={() => { tryVibrate(); setScore((s) => Math.max(0, s - 1)); }}
          disableRipple
          sx={{ width: 80, height: 80 }}
        >
          <RemoveIcon sx={{ fontSize: "2.2rem" }} />
        </IconButton>

        <Typography sx={{
          fontSize: "clamp(5rem, 22vw, 10rem)", fontWeight: 900, lineHeight: 1,
          color: isDark ? "#fff" : "#111", textShadow: "0 2px 30px rgba(0,0,0,0.5)",
          userSelect: "none",
        }}>
          {score}
        </Typography>

        <IconButton
          className="rb-score-btn"
          onClick={() => { tryVibrate(); setScore((s) => s + 1); }}
          disableRipple
          sx={{ width: 80, height: 80 }}
        >
          <AddIcon sx={{ fontSize: "2.2rem" }} />
        </IconButton>
      </Box>

      {/* Bottom bar */}
      <Box className="rb-middle-bar">
        <Button
          size="small"
          onClick={onBack}
          startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />}
          sx={{ color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)", fontSize: "0.7rem", textTransform: "none", fontWeight: 700, minWidth: 0, px: 1 }}
        >
          {t("home")}
        </Button>
        <Button
          className="rb-timer-pill"
          onClick={() => setTimerRunning((r) => !r)}
          startIcon={timerRunning ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayArrowIcon sx={{ fontSize: 15 }} />}
        >
          {formatTime(timer)}
        </Button>
        <Box sx={{ flex: 1 }} />
        <IconButton
          className="rb-bar-icon-btn"
          size="small"
          title={t("pick_legend_action")}
          onClick={() => setLegendPickerOpen(true)}
        >
          <EditIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
        </IconButton>
        <IconButton className="rb-bar-icon-btn" onClick={reset} size="small" title={t("reset")}>
          <RefreshIcon sx={{ fontSize: 20, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)" }} />
        </IconButton>
      </Box>

      {/* Legend picker */}
      <Dialog
        open={legendPickerOpen}
        onClose={() => setLegendPickerOpen(false)}
        fullWidth maxWidth="xs"
        slotProps={{ paper: { sx: { background: isDark ? "#0f0f22" : "#f4f4f8", borderRadius: 3, m: 2, maxHeight: "70vh" } } }}
      >
        <DialogTitle sx={{ color: isDark ? "#fff" : "#111", fontWeight: 700, pb: 1 }}>{t("choose_legend")}</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {legendId && (
              <Button size="small" onClick={() => { setLegendId(null); setLegendPickerOpen(false); }}
                sx={{ borderRadius: 2, textTransform: "none", color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", fontSize: "0.78rem" }}>
                {t("none")}
              </Button>
            )}
            {LEGENDS.map((l) => (
              <Box
                key={l.id}
                onClick={() => { setLegendId(l.id); setLegendPickerOpen(false); }}
                sx={{
                  width: 56, height: 72, borderRadius: 2, overflow: "hidden", cursor: "pointer",
                  border: legendId === l.id ? "2px solid #2979ff" : "2px solid transparent",
                  backgroundImage: `url(${getLegendUrl(l.id)})`,
                  backgroundSize: "cover", backgroundPosition: "center top",
                  "&:hover": { opacity: 0.85 },
                }}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Idle dim overlay — lowers brightness after inactivity to save battery. */}
      <Box
        onTouchStart={(e) => { if (dimmed) { e.stopPropagation(); markActive(); } }}
        onClick={() => { if (dimmed) markActive(); }}
        sx={{
          position: "fixed", inset: 0, zIndex: 1600,
          background: "#000",
          opacity: dimmed ? (Capacitor.isNativePlatform() ? 0.25 : 0.6) : 0,
          transition: "opacity 0.9s ease",
          pointerEvents: dimmed ? "auto" : "none",
        }}
      />
    </Box>
  );
}

// Trading — two-sided card trade value calculator

type TradeSide = "give" | "receive";

interface TradeItem {
  key: string;
  card: CatalogCard;
  qty: number;
  condition: CardCondition;
  foil: boolean;
  price: number | null; // per-unit, manual entry
}

const CONDITION_COLORS: Record<CardCondition, string> = {
  NM: "#4caf50",
  LP: "#8bc34a",
  MP: "#ffb300",
  HP: "#ff7043",
  DMG: "#ef5350",
};

function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

function itemTotal(it: TradeItem): number {
  return (it.price ?? 0) * it.qty;
}

function sideCardsTotal(items: TradeItem[]): number {
  return items.reduce((s, it) => s + itemTotal(it), 0);
}

function TradingView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const t = useT();
  const { cards, loading, error } = useCardCatalog();
  const priceBook = usePriceBook();
  const priceBookRef = useRef<PriceBook | null>(null);
  priceBookRef.current = priceBook;

  const [give, setGive] = useState<TradeItem[]>([]);
  const [receive, setReceive] = useState<TradeItem[]>([]);
  const [cashGive, setCashGive] = useState(0);
  const [cashReceive, setCashReceive] = useState(0);

  const [resetOpen, setResetOpen] = useState(false);
  const [snack, setSnack] = useState("");
  const [shareAnchor, setShareAnchor] = useState<null | HTMLElement>(null);

  // Card search sheet
  const [searchSide, setSearchSide] = useState<TradeSide | null>(null);
  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState("ALL");
  const [addFoil, setAddFoil] = useState(false);
  const [addCondition, setAddCondition] = useState<CardCondition>("NM");

  // Price / cash editing dialogs
  const [priceEdit, setPriceEdit] = useState<{ side: TradeSide; key: string } | null>(null);
  const [cashEdit, setCashEdit] = useState<TradeSide | null>(null);
  const [numInput, setNumInput] = useState("");

  const setterFor = (side: TradeSide) => (side === "give" ? setGive : setReceive);

  const sets = useMemo(() => Array.from(new Set(cards.map((c) => c.set))), [cards]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards
      .filter((c) => setFilter === "ALL" || c.set === setFilter)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || String(c.number).includes(q))
      .slice(0, 120);
  }, [cards, search, setFilter]);

  const giveTotal = sideCardsTotal(give) + cashGive;
  const receiveTotal = sideCardsTotal(receive) + cashReceive;
  const net = receiveTotal - giveTotal; // positive => you gain value

  // Light haptic whenever the balance recalculates.
  const itemCount = give.length + receive.length;
  useEffect(() => {
    if (itemCount > 0) tryVibrate(8);
  }, [net, itemCount]);

  function addCard(card: CatalogCard) {
    if (!searchSide) return;
    const price = lookupPrice(priceBookRef.current, card.id, addFoil);
    tryVibrate();
    setterFor(searchSide)((prev) => {
      const existing = prev.find((it) => it.card.id === card.id && it.condition === addCondition && it.foil === addFoil);
      if (existing) {
        return prev.map((it) => (it === existing ? { ...it, qty: it.qty + 1 } : it));
      }
      return [...prev, { key: genId(), card, qty: 1, condition: addCondition, foil: addFoil, price }];
    });
  }

  function updateItem(side: TradeSide, key: string, patch: Partial<TradeItem>) {
    setterFor(side)((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function removeItem(side: TradeSide, key: string) {
    tryVibrate(15);
    setterFor(side)((prev) => prev.filter((it) => it.key !== key));
  }

  function cycleCondition(side: TradeSide, it: TradeItem) {
    const idx = CONDITIONS.indexOf(it.condition);
    updateItem(side, it.key, { condition: CONDITIONS[(idx + 1) % CONDITIONS.length] });
  }

  function openPriceEdit(side: TradeSide, it: TradeItem) {
    setPriceEdit({ side, key: it.key });
    setNumInput(it.price != null ? String(it.price) : "");
  }

  function openCashEdit(side: TradeSide) {
    setCashEdit(side);
    setNumInput(String(side === "give" ? cashGive : cashReceive) === "0" ? "" : String(side === "give" ? cashGive : cashReceive));
  }

  function commitNumDialog() {
    const val = Math.max(0, parseFloat(numInput.replace(",", ".")) || 0);
    if (priceEdit) {
      updateItem(priceEdit.side, priceEdit.key, { price: numInput.trim() === "" ? null : val });
      setPriceEdit(null);
    } else if (cashEdit) {
      (cashEdit === "give" ? setCashGive : setCashReceive)(val);
      setCashEdit(null);
    }
    setNumInput("");
  }

  function resetTrade() {
    setGive([]); setReceive([]); setCashGive(0); setCashReceive(0);
    setResetOpen(false);
    tryVibrate(20);
  }

  function netMessage(): string {
    if (Math.abs(net) < 0.005) return t("trade_even");
    if (net > 0) return t("trade_up").replace("{amount}", formatMoney(net));
    return t("trade_owe").replace("{amount}", formatMoney(-net));
  }

  function buildSummary(): string {
    const lines: string[] = [];
    const block = (labelKey: string, items: TradeItem[], cash: number, total: number) => {
      lines.push(`${t(labelKey)} — ${formatMoney(total)}`);
      if (items.length === 0 && cash === 0) lines.push("  —");
      items.forEach((it) => {
        const tags = `${it.card.id}${it.foil ? " Foil" : ""} · ${it.condition}`;
        lines.push(`  ${it.qty}× ${it.card.name} [${tags}] ${it.price != null ? formatMoney(it.price) : "—"}`);
      });
      if (cash > 0) lines.push(`  + ${t("cash")}: ${formatMoney(cash)}`);
    };
    lines.push(t("trading_title"));
    lines.push("");
    block("side_give", give, cashGive, giveTotal);
    lines.push("");
    block("side_receive", receive, cashReceive, receiveTotal);
    lines.push("");
    lines.push(netMessage());
    return lines.join("\n");
  }

  async function doCopy() {
    try { await navigator.clipboard.writeText(buildSummary()); setSnack(t("summary_copied")); tryVibrate(15); } catch { /* ignore */ }
  }

  async function doShare() {
    const text = buildSummary();
    const nav = navigator as Navigator & { share?: (d: { text: string; title?: string }) => Promise<void> };
    if (nav.share) {
      try { await nav.share({ text, title: t("trading_title") }); return; } catch { return; }
    }
    doCopy();
  }

  // Renders the current trade to a PNG data URL (text-based, no remote images).
  function renderTradeImage(): string {
    const W = 720;
    const scale = 2;
    const rowH = 34;
    const headH = 52;
    const giveRows = give.length + (cashGive > 0 ? 1 : 0);
    const recvRows = receive.length + (cashReceive > 0 ? 1 : 0);
    const H = 96 + headH + Math.max(1, giveRows) * rowH + 26 + headH + Math.max(1, recvRows) * rowH + 96 + 40;

    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    const pad = 28;
    ctx.fillStyle = "#0f0f22";
    ctx.fillRect(0, 0, W, H);

    let y = 44;
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 26px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(t("trading_title"), pad, y);
    y += 40;

    const drawSection = (labelKey: string, accent: string, items: TradeItem[], cash: number, total: number) => {
      ctx.fillStyle = accent + "22";
      ctx.fillRect(pad, y, W - pad * 2, headH);
      ctx.fillStyle = accent;
      ctx.font = "800 19px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(t(labelKey), pad + 14, y + headH / 2);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.fillText(formatMoney(total), W - pad - 14, y + headH / 2);
      y += headH + 4;

      ctx.textAlign = "left";
      if (items.length === 0 && cash === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "500 15px system-ui, sans-serif";
        ctx.fillText(t("no_cards_yet"), pad + 14, y + rowH / 2);
        y += rowH;
      }
      items.forEach((it) => {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = "700 15px system-ui, sans-serif";
        const name = `${it.qty}×  ${it.card.name}`;
        ctx.fillText(name, pad + 14, y + rowH / 2);
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.font = "600 12px system-ui, sans-serif";
        ctx.fillText(`${it.card.id}${it.foil ? " · Foil" : ""} · ${it.condition}`, pad + 14 + ctx.measureText(name).width + 12, y + rowH / 2 + 1);
        ctx.textAlign = "right";
        ctx.fillStyle = it.price != null ? "#ffffff" : "rgba(255,255,255,0.4)";
        ctx.font = "700 15px system-ui, sans-serif";
        ctx.fillText(it.price != null ? formatMoney(itemTotal(it)) : "—", W - pad - 14, y + rowH / 2);
        ctx.textAlign = "left";
        y += rowH;
      });
      if (cash > 0) {
        ctx.fillStyle = "#ffb300";
        ctx.font = "700 15px system-ui, sans-serif";
        ctx.fillText(`+ ${t("cash")}`, pad + 14, y + rowH / 2);
        ctx.textAlign = "right";
        ctx.fillText(formatMoney(cash), W - pad - 14, y + rowH / 2);
        ctx.textAlign = "left";
        y += rowH;
      }
    };

    drawSection("side_give", "#2979ff", give, cashGive, giveTotal);
    y += 26;
    drawSection("side_receive", "#4caf50", receive, cashReceive, receiveTotal);

    y += 34;
    ctx.textAlign = "center";
    ctx.fillStyle = Math.abs(net) < 0.005 ? "rgba(255,255,255,0.6)" : (net > 0 ? "#4caf50" : "#ef5350");
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.fillText(netMessage(), W / 2, y);

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "600 12px system-ui, sans-serif";
    ctx.fillText("RiftMate", W / 2, H - 22);

    return canvas.toDataURL("image/png");
  }

  async function shareImage() {
    setShareAnchor(null);
    const dataUrl = renderTradeImage();
    try {
      if (Capacitor.isNativePlatform()) {
        const fileName = `trade-${Date.now()}.png`;
        await Filesystem.writeFile({ path: fileName, data: dataUrl.split(",")[1], directory: Directory.Cache });
        const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
        await Share.share({ title: t("trading_title"), files: [uri] });
      } else {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], "trade.png", { type: "image/png" });
        const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean; share?: (d: { files: File[]; title?: string }) => Promise<void> };
        if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
          await nav.share({ files: [file], title: t("trading_title") });
        } else {
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "trade.png";
          a.click();
        }
      }
    } catch { /* cancelled */ }
  }

  async function shareText() {
    setShareAnchor(null);
    await doShare();
  }

  const surface = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)";
  const textPrimary = isDark ? "#fff" : "#111";
  const textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";

  const sideAccent = (side: TradeSide) => (side === "give" ? "#2979ff" : "#4caf50");

  function itemRow(side: TradeSide, it: TradeItem) {
    const accent = sideAccent(side);
    return (
      <Box key={it.key} sx={{ display: "flex", alignItems: "center", gap: 1, background: `${accent}14`, border: `1px solid ${accent}40`, borderLeft: `3px solid ${accent}`, borderRadius: 2, px: 1, py: 0.8 }}>
        <Box sx={{ width: 40, height: 56, borderRadius: 1, overflow: "hidden", flexShrink: 0, border: `1px solid ${accent}66`, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
          <img src={getCardThumbUrl(it.card.id)} alt={it.card.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {it.card.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: textMuted }}>{it.card.id}</Typography>
            <Box onClick={() => cycleCondition(side, it)} sx={{ cursor: "pointer", px: 0.6, py: 0.05, borderRadius: "4px", background: `${CONDITION_COLORS[it.condition]}22`, border: `1px solid ${CONDITION_COLORS[it.condition]}66` }}>
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: CONDITION_COLORS[it.condition] }}>{it.condition}</Typography>
            </Box>
            <Box onClick={() => updateItem(side, it.key, { foil: !it.foil })} sx={{ cursor: "pointer", px: 0.6, py: 0.05, borderRadius: "4px", background: it.foil ? "rgba(156,39,176,0.18)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"), border: `1px solid ${it.foil ? "rgba(156,39,176,0.6)" : border}` }}>
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: it.foil ? "#ce93d8" : textMuted }}>{t("foil")}</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0 }}>
          <IconButton size="small" onClick={() => updateItem(side, it.key, { qty: Math.max(1, it.qty - 1) })} sx={{ color: textMuted, p: 0.3 }}>
            <RemoveIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: textPrimary, minWidth: 16, textAlign: "center" }}>{it.qty}</Typography>
          <IconButton size="small" onClick={() => updateItem(side, it.key, { qty: it.qty + 1 })} sx={{ color: textMuted, p: 0.3 }}>
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        <Box onClick={() => openPriceEdit(side, it)} sx={{ cursor: "pointer", textAlign: "right", minWidth: 58, flexShrink: 0 }}>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: it.price != null ? sideAccent(side) : textMuted }}>
            {it.price != null ? formatMoney(itemTotal(it)) : t("set_price")}
          </Typography>
          {it.price != null && it.qty > 1 && (
            <Typography sx={{ fontSize: "0.6rem", color: textMuted }}>{formatMoney(it.price)}×{it.qty}</Typography>
          )}
        </Box>
        <IconButton size="small" onClick={() => removeItem(side, it.key)} sx={{ color: textMuted, p: 0.3, flexShrink: 0 }}>
          <CloseIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
    );
  }

  function sideBlock(side: TradeSide, items: TradeItem[], cash: number, total: number) {
    const accent = sideAccent(side);
    return (
      <Box sx={{ background: `${accent}0d`, border: `1px solid ${accent}33`, borderRadius: 3, p: 1.25, display: "flex", flexDirection: "column", gap: 0.8 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: accent }}>{t(side === "give" ? "side_give" : "side_receive")}</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: "1.05rem", color: textPrimary }}>{formatMoney(total)}</Typography>
        </Box>
        {items.map((it) => itemRow(side, it))}
        {cash > 0 && (
          <Box onClick={() => openCashEdit(side)} sx={{ display: "flex", alignItems: "center", gap: 1, background: surface, border: `1px solid ${border}`, borderRadius: 2, px: 1.25, py: 0.7, cursor: "pointer" }}>
            <AttachMoneyIcon sx={{ fontSize: 18, color: "#ffb300" }} />
            <Typography sx={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, color: textPrimary }}>{t("cash")}</Typography>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: accent }}>{formatMoney(cash)}</Typography>
          </Box>
        )}
        {items.length === 0 && cash === 0 && (
          <Typography sx={{ fontSize: "0.78rem", color: textMuted, textAlign: "center", py: 1 }}>{t("no_cards_yet")}</Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, mt: 0.2 }}>
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => { setSearchSide(side); setSearch(""); }}
            sx={{ flex: 1, borderRadius: 2, textTransform: "none", fontWeight: 700, fontSize: "0.78rem", color: accent, border: `1px solid ${accent}55`, background: `${accent}14`, "&:hover": { background: `${accent}22` } }}
          >
            {t("add_card")}
          </Button>
          <Button
            size="small"
            startIcon={<AttachMoneyIcon sx={{ fontSize: 16 }} />}
            onClick={() => openCashEdit(side)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, fontSize: "0.78rem", color: textMuted, border: `1px solid ${border}`, "&:hover": { background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" } }}
          >
            {t("add_cash")}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: isDark ? "#08080f" : "#f4f4f8", color: textPrimary, pt: "env(safe-area-inset-top)", pb: "env(safe-area-inset-bottom)" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1.25, borderBottom: `1px solid ${border}` }}>
        <IconButton size="small" onClick={onBack} sx={{ color: textMuted }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography sx={{ flex: 1, fontWeight: 800, fontSize: "1.05rem" }}>{t("trading_title")}</Typography>
        <Select
          value="market"
          size="small"
          title={priceBook ? t("prices_updated").replace("{date}", (priceBook.sourceUpdated || priceBook.generatedAt).slice(0, 10)) : t("price_source")}
          MenuProps={{ slotProps: { paper: { sx: { background: isDark ? "#14142a" : "#fff", color: textPrimary } } } }}
          sx={{ fontSize: "0.72rem", fontWeight: 700, color: textMuted, mr: 0.5, "& .MuiOutlinedInput-notchedOutline": { borderColor: border }, "& .MuiSvgIcon-root": { color: textMuted }, "& .MuiSelect-select": { py: 0.5, pl: 1 } }}
        >
          <MenuItem value="market" sx={{ fontSize: "0.78rem" }}>{t("price_source_market")}</MenuItem>
          <MenuItem value="soon" disabled sx={{ fontSize: "0.78rem" }}>{t("price_source_soon")}</MenuItem>
        </Select>
        <Button size="small" startIcon={<RefreshIcon sx={{ fontSize: 15 }} />} onClick={() => setResetOpen(true)} sx={{ color: textMuted, textTransform: "none", fontWeight: 700, fontSize: "0.72rem", minWidth: 0 }}>
          {t("trade_reset")}
        </Button>
      </Box>

      {/* Trade body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {sideBlock("give", give, cashGive, giveTotal)}
        <Box sx={{ display: "flex", justifyContent: "center", my: -0.4 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: "50%", background: surface, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SwapVertIcon sx={{ fontSize: 20, color: textMuted }} />
          </Box>
        </Box>
        {sideBlock("receive", receive, cashReceive, receiveTotal)}
      </Box>

      {/* Sticky footer */}
      <Box sx={{ flexShrink: 0, borderTop: `1px solid ${border}`, px: 2, py: 1.5, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Typography sx={{ fontSize: "0.64rem", color: "#2979ff", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("side_give")}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: textPrimary }}>{formatMoney(giveTotal)}</Typography>
          </Box>
          <Box sx={{ textAlign: "center", flex: 1.4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: Math.abs(net) < 0.005 ? textMuted : (net > 0 ? "#4caf50" : "#ef5350") }}>
              {netMessage()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Typography sx={{ fontSize: "0.64rem", color: "#4caf50", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("side_receive")}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: textPrimary }}>{formatMoney(receiveTotal)}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button fullWidth size="small" startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />} onClick={doCopy} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, fontSize: "0.8rem", color: textPrimary, border: `1px solid ${border}`, background: surface, "&:hover": { background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" } }}>
            {t("copy_summary")}
          </Button>
          <Button fullWidth size="small" startIcon={<IosShareIcon sx={{ fontSize: 16 }} />} onClick={(e) => setShareAnchor(e.currentTarget)} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, fontSize: "0.8rem", color: "#fff", background: "linear-gradient(135deg, #2979ff 0%, #5c35d4 100%)", "&:hover": { filter: "brightness(1.08)" } }}>
            {t("share_trade")}
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={shareAnchor}
        open={Boolean(shareAnchor)}
        onClose={() => setShareAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{ paper: { sx: { background: isDark ? "#14142a" : "#fff", color: textPrimary, borderRadius: 2, border: `1px solid ${border}` } } }}
      >
        <MenuItem onClick={shareText} sx={{ fontSize: "0.85rem", fontWeight: 600, gap: 1 }}>
          <ContentCopyIcon sx={{ fontSize: 18, color: textMuted }} />
          {t("share_as_text")}
        </MenuItem>
        <MenuItem onClick={shareImage} sx={{ fontSize: "0.85rem", fontWeight: 600, gap: 1 }}>
          <IosShareIcon sx={{ fontSize: 18, color: textMuted }} />
          {t("share_as_image")}
        </MenuItem>
      </Menu>

      {/* Card search sheet */}
      <Dialog
        open={searchSide !== null}
        onClose={() => setSearchSide(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { background: isDark ? "#0f0f22" : "#f4f4f8", borderRadius: 3, m: 2, maxHeight: "85vh" } } }}
      >
        <DialogTitle sx={{ color: textPrimary, fontWeight: 700, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {t("add_card")}
          <IconButton size="small" onClick={() => setSearchSide(null)} sx={{ color: textMuted }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <TextField
            placeholder={t("search_cards")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            autoComplete="off"
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: textMuted }} /></InputAdornment>) } }}
            sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: "10px", background: surface, "& fieldset": { borderColor: border } }, "& .MuiOutlinedInput-input": { color: textPrimary } }}
          />
          {/* Add-mode: condition + foil defaults */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
            {CONDITIONS.map((c) => (
              <Box key={c} onClick={() => setAddCondition(c)} sx={{ cursor: "pointer", px: 0.9, py: 0.3, borderRadius: "6px", background: addCondition === c ? `${CONDITION_COLORS[c]}26` : surface, border: `1px solid ${addCondition === c ? CONDITION_COLORS[c] : border}` }}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: addCondition === c ? CONDITION_COLORS[c] : textMuted }}>{c}</Typography>
              </Box>
            ))}
            <Box onClick={() => setAddFoil((f) => !f)} sx={{ cursor: "pointer", px: 0.9, py: 0.3, borderRadius: "6px", background: addFoil ? "rgba(156,39,176,0.2)" : surface, border: `1px solid ${addFoil ? "rgba(156,39,176,0.6)" : border}` }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: addFoil ? "#ce93d8" : textMuted }}>{t("foil")}</Typography>
            </Box>
          </Box>
          {/* Set filter */}
          <Box sx={{ display: "flex", gap: 0.5, mb: 1.25, overflowX: "auto", pb: 0.5 }}>
            {["ALL", ...sets].map((s) => (
              <Box key={s} onClick={() => setSetFilter(s)} sx={{ cursor: "pointer", flexShrink: 0, px: 1, py: 0.4, borderRadius: "50px", background: setFilter === s ? "#2979ff" : surface, border: `1px solid ${setFilter === s ? "#2979ff" : border}` }}>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: setFilter === s ? "#fff" : textMuted }}>{s === "ALL" ? t("filter_all_sets") : s}</Typography>
              </Box>
            ))}
          </Box>

          {loading && <Typography sx={{ textAlign: "center", color: textMuted, mt: 3, fontSize: "0.9rem" }}>{t("catalog_loading")}</Typography>}
          {error && <Typography sx={{ textAlign: "center", color: textMuted, mt: 3, fontSize: "0.9rem" }}>{t("catalog_error")}</Typography>}
          {!loading && !error && results.length === 0 && <Typography sx={{ textAlign: "center", color: textMuted, mt: 3, fontSize: "0.9rem" }}>{t("no_matches")}</Typography>}

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", pb: 1 }}>
            {results.map((c) => (
              <Box key={c.id} onClick={() => addCard(c)} sx={{ cursor: "pointer", borderRadius: 2, overflow: "hidden", border: `1px solid ${border}`, "&:hover": { borderColor: "#2979ff" }, transition: "border-color 0.15s" }}>
                <img src={getCardThumbUrl(c.id)} alt={c.name} loading="lazy" style={{ width: "100%", aspectRatio: "63/88", objectFit: "cover", objectPosition: "top", display: "block" }} />
                <Box sx={{ px: 0.5, py: 0.4 }}>
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "0.56rem", color: textMuted }}>{c.id}</Typography>
                    {lookupPrice(priceBook, c.id, addFoil) != null && (
                      <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color: "#4caf50" }}>{formatMoney(lookupPrice(priceBook, c.id, addFoil)!)}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Price / cash numeric dialog */}
      <Dialog
        open={priceEdit !== null || cashEdit !== null}
        onClose={() => { setPriceEdit(null); setCashEdit(null); setNumInput(""); }}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { background: isDark ? "#0f0f22" : "#f4f4f8", borderRadius: 3, m: 2 } } }}
      >
        <DialogTitle sx={{ color: textPrimary, fontWeight: 700, pb: 1 }}>{cashEdit ? t("add_cash") : t("set_price")}</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <TextField
            autoFocus
            fullWidth
            type="number"
            value={numInput}
            onChange={(e) => setNumInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitNumDialog(); }}
            placeholder="0.00"
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><AttachMoneyIcon sx={{ fontSize: 18, color: textMuted }} /></InputAdornment>), inputProps: { min: 0, step: 0.25 } } }}
            sx={{ mt: 0.5, "& .MuiOutlinedInput-root": { borderRadius: "10px", background: surface, "& fieldset": { borderColor: border } }, "& .MuiOutlinedInput-input": { color: textPrimary, fontSize: "1.1rem", fontWeight: 700 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setPriceEdit(null); setCashEdit(null); setNumInput(""); }} sx={{ color: textMuted, textTransform: "none", fontWeight: 700 }}>{t("cancel")}</Button>
          <Button onClick={commitNumDialog} sx={{ color: "#2979ff", textTransform: "none", fontWeight: 800 }}>{t("set_price")}</Button>
        </DialogActions>
      </Dialog>

      {/* Reset confirmation */}
      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { background: isDark ? "#0f0f22" : "#f4f4f8", borderRadius: 3, m: 2 } } }}
      >
        <DialogTitle sx={{ color: textPrimary, fontWeight: 700, pb: 1 }}>{t("trade_reset_title")}</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography sx={{ color: textMuted, fontSize: "0.9rem" }}>{t("trade_reset_msg")}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetOpen(false)} sx={{ color: textMuted, textTransform: "none", fontWeight: 700 }}>{t("cancel")}</Button>
          <Button onClick={resetTrade} sx={{ color: "#ef5350", textTransform: "none", fontWeight: 800 }}>{t("trade_reset_yes")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}

// Main component

export default function RiftboundScore() {
  const initial = useMemo(loadSetup, []);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [view, setView] = useState<AppView>("home");
  const [mode, setMode] = useState<GameMode>(initial.mode);
  const [players, setPlayers] = useState<Player[]>(initial.players);
  const [maxPoints, setMaxPoints] = useState<number>(initial.maxPoints);
  const [useXp, setUseXp] = useState<boolean>(initial.useXp);
  const [utilitiesMode, setUtilitiesMode] = useState<UtilitiesMode>(() => loadConfig().utilitiesMode);
  const [lang, setLang] = useState<Lang>(() => loadConfig().lang);
  const t = (key: string) => TRANSLATIONS[key]?.[lang] ?? TRANSLATIONS[key]?.en ?? key;

  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [tossOpen, setTossOpen] = useState(false);
  const [tossMsg, setTossMsg] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logOpen, setLogOpen] = useState(false);

  const [starterHighlightId, setStarterHighlightId] = useState<string | null>(null);
  const [starterSpinning, setStarterSpinning] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [colorAnchorEl, setColorAnchorEl] = useState<HTMLElement | null>(null);
  const [colorPlayerId, setColorPlayerId] = useState<string | null>(null);
  const [legendPickerOpen, setLegendPickerOpen] = useState(false);
  const [legendPickerPlayerId, setLegendPickerPlayerId] = useState<string | null>(null);
  const [legendSearch, setLegendSearch] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable refs so useCallback handlers never go stale
  const playersRef = useRef(players);
  playersRef.current = players;
  const timerValueRef = useRef(timer);
  timerValueRef.current = timer;
  const maxPointsRef = useRef(maxPoints);
  maxPointsRef.current = maxPoints;

  // Only save to localStorage during setup — not on every score change during gameplay
  useEffect(() => {
    if (view === "game") return;
    const state: SetupState = { mode, players, maxPoints, useXp };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [mode, players, maxPoints, useXp, view]);

  // Pause timer when app is backgrounded (saves battery)
  useEffect(() => {
    function onVisChange() {
      if (document.hidden) setTimerRunning(false);
    }
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, []);

  // Hardware back button — navigate instead of exiting
  const viewRef = useRef(view);
  viewRef.current = view;
  const gameBackRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    const listenerPromise = CapApp.addListener("backButton", () => {
      const current = viewRef.current;
      if (current === "home") {
        CapApp.exitApp();
      } else if (current === "game") {
        if (gameBackRef.current) gameBackRef.current();
        else { setView("setup"); setLog([]); setTimerRunning(false); }
      } else {
        setView("home");
      }
    });
    return () => { listenerPromise.then((h) => h.remove()); };
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  function handleSwitchMode(m: GameMode) {
    setMode(m);
    setPlayers((prev) => makePlayers(m, prev));
  }

  const handleChangeScore = useCallback((id: string, delta: number) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, score: Math.max(0, p.score + delta) } : p));
  }, []);

  const handleChangeXp = useCallback((id: string, delta: number) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, xp: Math.max(0, p.xp + delta) } : p));
  }, []);

  const handleLogAction = useCallback((playerId: string, action: LogAction) => {
    tryVibrate();
    const player = playersRef.current.find((p) => p.id === playerId)!;
    let newScore = player.score;
    let newHistory = player.history;
    if (action === "Conquer" || action === "Hold" || action === "Ability") {
      if (player.score < maxPointsRef.current) {
        newHistory = [...player.history, action];
        newScore = newHistory.length;
      }
    } else if (action === "+1") {
      newScore = Math.min(player.score + 1, maxPointsRef.current);
    } else if (action === "-1") {
      newScore = Math.max(player.score - 1, 0);
      newHistory = player.history.slice(0, Math.max(0, player.history.length - 1));
    }
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, score: newScore, history: newHistory } : p)));
    setLog((l) => [
      ...l,
      {
        id: genId(),
        playerId,
        playerName: player.name,
        playerColor: player.color,
        action,
        score: newScore,
        gameTime: timerValueRef.current,
      },
    ]);
  }, []);

  function handleLaunch() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, xp: 0, history: [] })));
    setTimer(0);
    setTimerRunning(false);
    setView("game");
  }

  function handleResetPlayers() {
    setPlayers(makePlayers(mode));
  }

  function handleResetGame() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, xp: 0, history: [] })));
    setLog([]);
  }

  function handleResetTimer() {
    setTimer(0);
  }

  function handleToss() {
    setTossMsg(Math.random() < 0.5 ? t("heads") : t("tails"));
    setTossOpen(true);
  }

  function handleStarterSpin() {
    if (starterSpinning) return;
    setStarterSpinning(true);
    setStarterHighlightId(null);

    const snapshot = players;
    const playerIds = snapshot.map((p) => p.id);
    const finalIdx = Math.floor(Math.random() * playerIds.length);
    const totalCycles = 22;
    let cycle = 0;

    function step() {
      cycle++;
      if (cycle < totalCycles) {
        const idx = (cycle - 1) % playerIds.length;
        setStarterHighlightId(playerIds[idx]);
        const progress = cycle / totalCycles;
        const delay = 70 + Math.pow(progress, 2.2) * 480;
        setTimeout(step, delay);
      } else {
        setStarterHighlightId(playerIds[finalIdx]);
        setStarterSpinning(false);
        setTossMsg(t("goes_first").replace("{name}", snapshot[finalIdx].name));
        setTossOpen(true);
        tryVibrate(80);
        setTimeout(() => setStarterHighlightId(null), 3000);
      }
    }

    setTimeout(step, 70);
  }

  function startEdit(player: Player) {
    setEditingId(player.id);
    setEditName(player.name);
  }

  function commitEdit(id: string) {
    if (editName.trim()) {
      setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: editName.trim() } : p)));
    }
    setEditingId(null);
  }

  function openColorPicker(e: React.MouseEvent<HTMLElement>, playerId: string) {
    setColorAnchorEl(e.currentTarget);
    setColorPlayerId(playerId);
  }

  function pickColor(color: string) {
    if (colorPlayerId) {
      setPlayers((prev) => prev.map((p) => (p.id === colorPlayerId ? { ...p, color } : p)));
    }
    setColorAnchorEl(null);
    setColorPlayerId(null);
  }

  function openLegendPicker(playerId: string) {
    setLegendPickerPlayerId(playerId);
    setLegendPickerOpen(true);
  }

  function pickLegend(legendId: string | null) {
    if (legendPickerPlayerId) {
      setPlayers((prev) => prev.map((p) => (p.id === legendPickerPlayerId ? { ...p, legendId } : p)));
    }
    setLegendPickerOpen(false);
    setLegendPickerPlayerId(null);
    setLegendSearch("");
  }

  if (view === "home") {
    return <LangContext.Provider value={lang}><HomeScreen onMultiplayer={() => setView("setup")} onSolo={() => setView("solo")} onConfig={() => setView("config")} onRules={() => setView("rules")} onTrading={() => setView("trading")} /></LangContext.Provider>;
  }

  if (view === "config") {
    return (
      <LangContext.Provider value={lang}>
        <ConfigScreen
          utilitiesMode={utilitiesMode}
          onChangeUtilitiesMode={(m) => {
            setUtilitiesMode(m);
            persistConfig({ utilitiesMode: m });
          }}
          lang={lang}
          onChangeLang={(l) => {
            setLang(l);
            persistConfig({ lang: l });
          }}
          onBack={() => setView("home")}
        />
      </LangContext.Provider>
    );
  }

  if (view === "solo") {
    return <LangContext.Provider value={lang}><SoloView onBack={() => setView("home")} /></LangContext.Provider>;
  }

  if (view === "rules") {
    return <LangContext.Provider value={lang}><RulesView onBack={() => setView("home")} /></LangContext.Provider>;
  }

  if (view === "trading") {
    return <LangContext.Provider value={lang}><TradingView onBack={() => setView("home")} /></LangContext.Provider>;
  }

  if (view === "game") {
    return (
      <LangContext.Provider value={lang}>
      <GameView
        players={players}
        mode={mode}
        maxPoints={maxPoints}
        useXp={useXp}
        timer={timer}
        timerRunning={timerRunning}
        tossOpen={tossOpen}
        tossMsg={tossMsg}
        log={log}
        logOpen={logOpen}
        onChangeScore={handleChangeScore}
        onChangeXp={handleChangeXp}
        onLogAction={handleLogAction}
        onToggleTimer={() => setTimerRunning((r) => !r)}
        onReset={handleResetGame}
        onToss={handleToss}
        onCloseToss={() => setTossOpen(false)}
        onBack={() => { setView("setup"); setLog([]); setTimerRunning(false); }}
        onOpenLog={() => setLogOpen(true)}
        onCloseLog={() => setLogOpen(false)}
        onResetTimer={handleResetTimer}
        starterHighlightId={starterHighlightId}
        starterSpinning={starterSpinning}
        onStarterSpin={handleStarterSpin}
        utilitiesMode={utilitiesMode}
        backRequestRef={gameBackRef}
      />
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={lang}>
    <Box className="rb-setup" sx={{
      '--rb-bg': isDark ? '#070710' : '#f0f0f6',
      '--rb-surface': isDark ? '#0e0e20' : '#ffffff',
      '--rb-surface2': isDark ? '#141428' : '#e4e4ef',
      '--rb-surface3': isDark ? '#1a1a32' : '#d4d4e4',
      '--rb-text': isDark ? '#ffffff' : '#111111',
      '--rb-text-muted': isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
      '--rb-border': isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
      '--rb-border-subtle': isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
      '--rb-icon-color': isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
      '--rb-swatch-border': isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.15)',
      '--rb-swatch-hover': isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
      '--rb-mode-active-bg': isDark ? '#2a2a4a' : '#d0d0e0',
      '--rb-reset-color': isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)',
    } as React.CSSProperties}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 2, py: 1.5, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
        <IconButton size="small" onClick={() => setView("home")} sx={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography className="rb-setup-title" variant="h6">{t("setup_title")}</Typography>
      </Box>

      <Box sx={{ px: 2, pt: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>

      <Box className="rb-mode-tabs">
        {MODE_ORDER.map((m) => (
          <Button key={m} className={`rb-mode-btn${mode === m ? " rb-mode-btn--active" : ""}`} onClick={() => handleSwitchMode(m)}>
            {t(`mode_${m}`)}
          </Button>
        ))}
      </Box>

      <Typography className="rb-section-label">{t("configure_players")}</Typography>
      <Box className="rb-players-list">
        {players.map((player) => (
          <Box key={player.id} className="rb-player-row">
            <Box
              className="rb-player-avatar"
              style={{ background: player.legendId ? "transparent" : player.color, cursor: "pointer", overflow: "hidden", position: "relative" }}
              onClick={() => openLegendPicker(player.id)}
            >
              {player.legendId ? (
                <img
                  src={getLegendUrl(player.legendId)}
                  alt="legend"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block", borderRadius: 8 }}
                />
              ) : (
                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.6)", fontWeight: 700, textAlign: "center", lineHeight: 1.2, px: 0.5 }}>
                    {t("pick_legend")}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box className="rb-player-name-area">
              {editingId === player.id ? (
                <TextField
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => commitEdit(player.id)}
                  onKeyDown={(e) => { if (e.key === "Enter") commitEdit(player.id); }}
                  size="small"
                  variant="standard"
                  autoFocus
                  sx={{
                    "& .MuiInput-input": { color: isDark ? "#fff" : "#111", fontSize: "1.05rem", fontWeight: 700 },
                    "& .MuiInput-underline:before": { borderBottomColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)", borderBottomStyle: "dashed" },
                  }}
                />
              ) : (
                <Box className="rb-name-click-row" onClick={() => startEdit(player)}>
                  <Typography className="rb-player-name-text">{player.name}</Typography>
                  <EditIcon className="rb-edit-icon" />
                </Box>
              )}
            </Box>
            <Box className="rb-color-swatch" style={{ background: player.color }} onClick={(e) => openColorPicker(e, player.id)}>
              <KeyboardArrowDownIcon className="rb-swatch-chevron" />
            </Box>
          </Box>
        ))}
      </Box>

      <Typography className="rb-section-label">{t("game_options")}</Typography>
      <Box className="rb-options-card">
        <Box className="rb-option-row">
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <GradeIcon sx={{ fontSize: 18, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)" }} />
            <Typography className="rb-option-label">{t("max_points")}</Typography>
          </Box>
          <Box className="rb-stepper">
            <IconButton size="small" className="rb-stepper-btn" onClick={() => setMaxPoints((p) => Math.max(1, p - 1))}>
              <RemoveIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography className="rb-stepper-value">{maxPoints}</Typography>
            <IconButton size="small" className="rb-stepper-btn" onClick={() => setMaxPoints((p) => p + 1)}>
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
        <Box className="rb-option-row rb-option-row--last">
          <Typography className="rb-option-label">{t("use_xp")}</Typography>
          <Switch checked={useXp} onChange={(e) => setUseXp(e.target.checked)} size="small" color="primary" />
        </Box>
      </Box>

      <Box className="rb-bottom-actions">
        <Button variant="contained" className="rb-launch-btn" onClick={handleLaunch}>{t("launch_game")}</Button>
        <Button className="rb-reset-btn" onClick={handleResetPlayers}>↺ {t("reset_players")}</Button>
      </Box>

      </Box>

      <Popover
        open={Boolean(colorAnchorEl)}
        anchorEl={colorAnchorEl}
        onClose={() => setColorAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{ paper: { sx: { background: isDark ? "#14142a" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)"}`, borderRadius: 2 } } }}
      >
        <Box sx={{ p: 1.5, display: "grid", gridTemplateColumns: "repeat(4, 32px)", gap: "8px" }}>
          {PRESET_COLORS.map((c) => (
            <Box
              key={c}
              onClick={() => pickColor(c)}
              sx={{
                width: 32, height: 32, borderRadius: "50%", background: c, cursor: "pointer",
                border: `2px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
                "&:hover": { border: `2px solid ${isDark ? "#fff" : "#333"}` },
                transition: "border 0.15s",
              }}
            />
          ))}
        </Box>
      </Popover>

      <Dialog
        open={legendPickerOpen}
        onClose={() => { setLegendPickerOpen(false); setLegendSearch(""); }}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: {
          sx: {
            background: isDark ? "#0f0f22" : "#f4f4f8",
            borderRadius: 3,
            m: 2,
            maxHeight: "80vh",
          },
        } }}
      >
        <DialogTitle sx={{ color: isDark ? "#fff" : "#111", fontWeight: 700, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {t("choose_legend")}
          <Button size="small" onClick={() => { pickLegend(null); setLegendSearch(""); }} sx={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", fontSize: "0.75rem", textTransform: "none", minWidth: 0 }}>
            {t("no_legend")}
          </Button>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <TextField
            placeholder={t("search_legends")}
            value={legendSearch}
            onChange={(e) => setLegendSearch(e.target.value)}
            size="small"
            fullWidth
            autoComplete="off"
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)" },
              },
              "& .MuiOutlinedInput-input": { color: isDark ? "#fff" : "#111", fontSize: "0.9rem" },
              "& .MuiOutlinedInput-input::placeholder": { color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", opacity: 1 },
            }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", pb: 1 }}>
            {LEGENDS.filter((l) => l.name.toLowerCase().includes(legendSearch.toLowerCase())).map((legend) => {
              const takenBy = players.find((p) => p.id !== legendPickerPlayerId && p.legendId === legend.id);
              return (
              <Box
                key={legend.id}
                onClick={() => pickLegend(legend.id)}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  "&:hover": { borderColor: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" },
                  transition: "border-color 0.15s",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <img
                  src={getLegendUrl(legend.id)}
                  alt={legend.name}
                  loading="lazy"
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "top", display: "block", opacity: takenBy ? 0.55 : 1 }}
                />
                {takenBy && (
                  <CheckCircleIcon
                    titleAccess={takenBy.name}
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      fontSize: 22,
                      color: "#4caf50",
                      background: "rgba(0,0,0,0.55)",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
    </LangContext.Provider>
  );
}
