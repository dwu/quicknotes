import "./style.css"

import { basicSetup, EditorView } from "codemirror"
import { EditorState, EditorSelection } from "@codemirror/state"
import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { Note, NoteIndex } from "./note";
import { initResizerFn } from "./resizer";

const editor = document.querySelector(".editor")!
const resizer = document.querySelector<HTMLElement>(".resizer")!
const sidebar = document.querySelector<HTMLElement>(".sidebar")!
const header = document.querySelector<HTMLElement>(".header")!
const noteList = document.querySelector<HTMLElement>(".notelist")!
const status = document.querySelector<HTMLElement>("#status")!
const size = document.querySelector<HTMLElement>("#size")!
const inputName = document.querySelector<HTMLInputElement>("#name")!
const inputNewName = document.querySelector<HTMLInputElement>("#newname")!
const btnSave = document.querySelector<HTMLElement>("#btnsave")!
const btnNew = document.querySelector<HTMLElement>("#btnnew")!
const btnDel = document.querySelector<HTMLElement>("#btndel")!
const btnImportant = document.querySelector<HTMLElement>("#btnimportant")!

let updateListenerExtension = EditorView.updateListener.of((update) => {
    if (editorDirty) {
        return
    }
    if (update.docChanged) {
        editorDirty = true
        status.innerHTML = "Unsaved changes"
    }
});

const editorExtensions = [
    basicSetup,
    keymap.of([
        {
            key: "Ctrl-s", preventDefault: true, run: () => {
                saveNote()
                return true
            },
        },
        indentWithTab
    ]),
    EditorView.lineWrapping,
    updateListenerExtension,
]

const editorView = new EditorView({
    extensions: editorExtensions,
    parent: editor,
})

btnNew.addEventListener("click", () => newNote())
btnSave.addEventListener("click", () => saveNote())
btnDel.addEventListener("click", () => deleteNote())
btnImportant.addEventListener("click", () => toggleImportant())

// save on browser window losing focus
window.addEventListener("blur", () => saveNote())

function newNote() {
    const newNoteName = inputNewName.value.trim()
    inputNewName.value = "";
    if (newNoteName.length > 0) {
        noteIndex.addNote(Note.newWithName(newNoteName))
    } else {
        noteIndex.addNote(Note.newWithName(new Date().toISOString()))
    }
    refreshEditor()
    refreshNoteIndex()
}

function saveNote() {
    noteIndex.currentNote!.content = editorView.state.doc.toString()
    noteIndex.currentNote!.save()

    if (inputName.value.trim() != noteIndex.currentNote!.info!.name) {
        noteIndex.saveCurrentNote(inputName.value.trim())
    } else {
        noteIndex.saveCurrentNote()
    }

    editorDirty = false
    status.innerHTML = ""

    refreshNoteIndex()
    refreshSize()
}

function deleteNote() {
    const hasNotes = noteIndex.deleteCurrentNote()
    if (!hasNotes) {
        inputName.value = "";
    }

    refreshEditor()
    refreshNoteIndex()
}

function toggleImportant() {
    noteIndex.toggleCurrentNoteImportant()
    refreshNoteIndex()
    editorView.focus()
}

function refreshNoteIndex() {
    noteList.innerHTML = "";
    for (let info of noteIndex.sortedNoteList()) {
        const note = document.createElement("a")

        note.setAttribute("href", "#note-" + info.id)
        note.innerHTML = info.name

        if (info.important) {
            note.classList.add("important")
        }

        note.addEventListener("click", (ev: MouseEvent) => {
            // save current note before switching notes
            saveNote()

            // display target note content and update views
            const target = (ev.target as HTMLElement)
            const noteid = target.getAttribute("href")!.replace("#note-", "")
            noteIndex.currentNote = Note.loadById(noteid)

            refreshEditor()
            refreshNoteIndex()
        })
        noteList.appendChild(note)
    }

    inputName.value = noteIndex.currentNote!.info!.name;
    highlightOnly(noteIndex.currentNote!)
}

function highlightOnly(note: Note) {
    if (typeof note == 'undefined')
        return

    const noteLinks = document.querySelectorAll("div.notelist > a")
    noteLinks.forEach((el) => {
        if (el.getAttribute("href") == "#note-" + note.info!.id) {
            el.classList.add("active")
        } else {
            el.classList.remove("active")
        }
    })
}

function refreshEditor() {
    if (typeof noteIndex.currentNote != 'undefined') {
        // there's a current note, show its content in the editor
        inputName.setAttribute("value", noteIndex.currentNote!.info!.name)
        let newState = EditorState.create({
            extensions: editorExtensions,
            doc: noteIndex.currentNote!.content,
            selection: EditorSelection.cursor(0),
        });
        editorView.setState(newState)
        editorView.focus()
    } else {
        // there's no current note, clear and disable the editor
        inputName.setAttribute("value", "")
        let newState = EditorState.create({
            extensions: editorExtensions,
            doc: "",
            selection: EditorSelection.cursor(0),
        });
        editorView.setState(newState)
        inputNewName.focus()
    }
}

function refreshSize() {
    const usedAmount = calculateTotalLocalStorageUsage()
    size.innerHTML = `Used: ${usedAmount}kb`;
}

function calculateTotalLocalStorageUsage(): string {
    let total = 0;
    for (let key in localStorage) {
        let value = localStorage.getItem(key);
        total += (new TextEncoder().encode(value!)).length;
    }
    let inKB = (total / 1024);
    return inKB.toFixed(2);
}

initResizerFn(resizer, sidebar, header)

let editorDirty = false;

const noteIndex = new NoteIndex()
const hasNotes = noteIndex.init()
if (hasNotes) {
    refreshEditor()
} else {
    inputName.value = "";
}
refreshNoteIndex();
refreshSize();