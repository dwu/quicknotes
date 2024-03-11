function htmlEncode(s: string): string {
    let textArea = document.createElement('textarea');
    textArea.innerText = s;
    return textArea.innerHTML;
}

function htmlDecode(s: string): string {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = s;
    return textArea.value;
}

function epochConvert(timestampString: string): string {
    try {
        var milliseconds = parseInt(timestampString) * 1000;
        var date = new Date(milliseconds);
        return "ISO Timestamp  : " + date.toISOString() + "\nLocal Timestamp: " + date.toLocaleString();
    } catch (err) {
        alert(err);
        return timestampString;
    }
}

function removeLinebreaks(s: string): string {
    s = s.replace(new RegExp('\\r\\n', 'g'), '');
    s = s.replace(new RegExp('\\n', 'g'), '');
    return s;
}

function trimLines(s: string): string {
    s = s.replace(new RegExp('\\s*\\r\\n\\s*', 'g'), '\r\n');
    s = s.replace(new RegExp('\\s*\\n\\s*', 'g'), '\n');
    return s;
}

function removeBlanks(s: string): string {
    s = s.replace(new RegExp('\\s*', 'g'), '');
    return s;
}

function compactBlanks(s: string): string {
    s = s.replace(new RegExp('\\s+', 'g'), ' ');
    return s;
}

function removeBackslashes(s: string): string {
    s = s.replace(new RegExp('\\\\', 'g'), '');
    return s;
}

function insertBlanksAfterNCharacters(s: string, n: number): string {
    s = s.replace(new RegExp('(.{' + n + '})', 'g'), '$1 ');
    return s;
}

export {
    htmlEncode,
    htmlDecode,
    epochConvert,
    removeLinebreaks,
    trimLines,
    removeBlanks,
    compactBlanks,
    removeBackslashes,
    insertBlanksAfterNCharacters
}