import { v4 as uuidv4 } from "uuid"

const KEY_PREFIX_NOTE = "note:"

class Note {
    id: string
    name: string
    content: string
    important: boolean

    constructor() {
        this.id = ""
        this.name = ""
        this.content = ""
        this.important = false
    }

    static newWithName(name: string): Note {
        const note = new Note()
        note.id = uuidv4()
        note.name = name
        note.important = false
        note.content = ""
        note.save()

        return note
    }

    static loadById(id: string): Note {
        return this.deserialize(localStorage.getItem(KEY_PREFIX_NOTE + id)!)
    }

    static deserialize(s: string): Note {
        const val = JSON.parse(s)

        const note = new Note()
        note.id = val.id
        note.name = val.name
        note.important = val.important
        note.content = val.content

        return note
    }

    private serialize(): string {
        return JSON.stringify({
            "id": this.id,
            "name": this.name,
            "important": this.important,
            "content": this.content
        })
    }

    save() {
        localStorage.setItem(KEY_PREFIX_NOTE + this.id, this.serialize())
    }
}

class NoteRepository {
    _currentId: string | undefined
    _currentNote: Note | undefined

    set currentId(id: string | undefined) {
        this._currentId = id
        if (typeof this._currentId != 'undefined') {
            this._currentNote = Note.loadById(this._currentId)
        }
    }

    get currentNote(): Note | undefined {
        if (typeof this._currentId == 'undefined') {
            return undefined
        }

        return this._currentNote
    }

    addNote(note: Note) {
        note.save()
        this.currentId = note.id
    }

    saveCurrentNote(newname?: string) {
        if (typeof this._currentId == 'undefined') {
            return undefined
        }

        if (typeof newname != 'undefined' && newname != this.currentNote!.name!) {
            this.currentNote!.name = newname
        }
        this.currentNote!.save()
    }

    deleteCurrentNote(): boolean {
        if (typeof this._currentId == 'undefined') {
            return true
        }

        if (confirm(`Delete note "${this.currentNote!.name}?"`)) {
            localStorage.removeItem(KEY_PREFIX_NOTE + this._currentId)
            return this.selectFirstNote()
        } else {
            return true
        }
    }

    toggleCurrentNoteImportant() {
        this.currentNote!.important = !this.currentNote!.important
        this.currentNote!.save()
    }

    sortedNoteInfoList(): any[] {
        const entries: any[][] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const noteAsString = localStorage.getItem(key!) as string
            const note = Note.deserialize(noteAsString)
            entries.push([note.id, note.name, note.important])
        }

        const sortedEntries = entries.sort(function (a, b) { return a[1].localeCompare(b[1]) })
        return sortedEntries.map((entry) => {
            return {
                "id": entry[0],
                "name": entry[1],
                "important": entry[2],
            }
        });
    }

    sortedNoteIdList(): string[] {
        return this.sortedNoteInfoList().map((entry) => entry.id as string)
    }

    selectFirstNote(): boolean {
        // if there are notes, then select the first note
        const noteIds = this.sortedNoteIdList()
        if (noteIds.length > 0) {
            this.currentId = noteIds[0]
            return true;
        } else {
            this.currentId = undefined;
            return false;
        }
    }

    init(): boolean {
        return this.selectFirstNote()
    }
}

export { Note, NoteRepository };