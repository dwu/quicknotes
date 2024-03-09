import { v4 as uuidv4 } from "uuid"

const KEY_NOTEINDEX = "noteindex"
const KEY_PREFIX_NOTE = "note:"

class NoteInfo {
    id: string
    name: string
    important: boolean

    constructor(id: string, name: string, important: boolean) {
        this.id = id
        this.name = name
        this.important = important
    }
}

class NoteIndex {
    currentNote: Note | undefined
    infos: Map<string, NoteInfo>

    constructor() {
        this.infos = new Map<string, NoteInfo>()
    }

    recover() {
        this.infos.clear()
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)!
            if (key.split(":")[0] == "note") {
                const note = Note.loadById(localStorage.getItem(key)!)
                this.infos.set(note.info!.id, new NoteInfo(note.info!.id, note.info!.name, note.info!.important))
            }
        }
    }

    addNote(note: Note) {
        this.currentNote = note
        note.save()
        this.infos.set(note.info!.id, note.info!)
        this.save()
    }

    saveCurrentNote(newname?: string) {
        if (typeof newname != 'undefined' && newname != this.currentNote!.info!.name!) {
            this.currentNote!.info!.name = newname
            const info = this.infos.get(this.currentNote!.info!.id!)
            info!.name = newname!
            this.infos.set(info!.id, info!)
            this.save()
        }
        this.currentNote!.save()
    }

    deleteCurrentNote(): boolean {
        localStorage.removeItem(KEY_PREFIX_NOTE + this.currentNote!.info!.id)
        this.infos.delete(this.currentNote!.info!.id)
        this.save()
        return this.selectFirstNote()
    }

    toggleCurrentNoteImportant() {
        this.currentNote!.info!.important = !this.currentNote!.info!.important
        this.currentNote!.save()

        const info = this.infos.get(this.currentNote!.info!.id!)
        info!.important = !info!.important
        this.infos.set(info!.id, info!)
        this.save()
    }

    selectFirstNote(): boolean {
        // if there are notes, then select the first note
        if (this.infos.size > 0) {
            this.currentNote = Note.loadById(this.sortedNoteList()[0].id)
            return true;
        } else {
            this.currentNote = undefined
            return false;
        }
    }

    private stateFrom(s: string) {
        this.infos = new Map(Object.entries(JSON.parse(s)))
    }

    private serialize(): string {
        return JSON.stringify(Object.fromEntries(this.infos))
    }

    sortedNoteList(): NoteInfo[] {
        const sortedIds = Array.from<[string, NoteInfo]>(this.infos.entries()).sort(function (a, b) { return a[1].name.localeCompare(b[1].name) })
        return sortedIds.map((id) => this.infos.get(id[0])) as NoteInfo[];
    }

    init(): boolean {
        const val = localStorage.getItem(KEY_NOTEINDEX)
        if (val == null) {
            // initialize empty index
            this.save()
        } else {
            this.stateFrom(val)
        }

        return this.selectFirstNote()
    }

    save() {
        localStorage.setItem(KEY_NOTEINDEX, this.serialize())
    }
}

class Note {
    info: NoteInfo | undefined
    content: string
    important: boolean

    constructor() {
        this.info = undefined
        this.content = ""
        this.important = false
    }

    static newWithName(name: string): Note {
        const note = new Note()
        note.info = new NoteInfo(uuidv4(), name, false)
        note.save()

        return note
    }

    static deserialize(s: string): Note {
        const val = JSON.parse(s)

        const note = new Note()
        note.info = new NoteInfo(val.info.id, val.info.name, val.info.important)
        note.content = val.content

        return note
    }

    static loadById(id: string): Note {
        return this.deserialize(localStorage.getItem(KEY_PREFIX_NOTE + id)!)
    }

    serialize(): string {
        return JSON.stringify({
            "info": this.info,
            "content": this.content
        })
    }

    save() {
        localStorage.setItem(KEY_PREFIX_NOTE + this.info!.id, this.serialize())
    }
}


export { Note, NoteInfo, NoteIndex };