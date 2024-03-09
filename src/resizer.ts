function initResizerFn(resizer: HTMLElement, sidebar: HTMLElement, header: HTMLElement) {
    let x: number, w: number

    function rs_mousedownHandler(e: MouseEvent) {
        x = e.clientX

        let sbWidth = window.getComputedStyle(sidebar).width
        w = parseInt(sbWidth, 10)

        document.addEventListener("mousemove", rs_mousemoveHandler)
        document.addEventListener("mouseup", rs_mouseupHandler)
    }

    function rs_mousemoveHandler(e: MouseEvent) {
        let dx = e.clientX - x
        let cw = w + dx
        if (cw < 700) {
            sidebar.style.width = `${cw}px`
            header.style.setProperty("--sidebar-width", `${cw}px`)
        }
    }

    function rs_mouseupHandler() {
        document.removeEventListener("mouseup", rs_mouseupHandler)
        document.removeEventListener("mousemove", rs_mousemoveHandler)
    }

    resizer.addEventListener("mousedown", rs_mousedownHandler)
}

export { initResizerFn }