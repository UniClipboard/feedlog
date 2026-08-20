import { set } from "zod"

const MD_EDITOR_MODAL_WRAPPER_SELECTOR = ".md-editor-modal-container > div"
const MD_EDITOR_ZOOM_LAYER_SELECTOR = ".medium-zoom-overlay, .medium-zoom-image--opened"
const MD_EDITOR_EXTERNAL_LAYER_SELECTOR = [
  ".md-editor-modal-container",
  ".md-editor-modal-mask",
  ".md-editor-modal",
  ".medium-zoom-overlay",
  ".medium-zoom-image--opened",
].join(", ")

function hasDom() {
  return typeof document !== "undefined"
}

function isVisible(element: Element) {
  const style = window.getComputedStyle(element)
  return style.display !== "none" && style.visibility !== "hidden"
}

export function isMdEditorModalOpen() {
  if (!hasDom()) return false

  return [...document.querySelectorAll(MD_EDITOR_MODAL_WRAPPER_SELECTOR)].some(isVisible)
}

export function isMdEditorZoomOpen() {
  if (!hasDom()) return false

  return document.body.classList.contains("medium-zoom--opened")
    || !!document.querySelector(MD_EDITOR_ZOOM_LAYER_SELECTOR)
}

export function isMdEditorModalOrZoomOpen() {
  return isMdEditorModalOpen() || isMdEditorZoomOpen()
}

export function preventShadcnDialogClose(e: Event) {
  if (isMdEditorModalOrZoomOpen()) {
    e.preventDefault()
  }
}

export function isMdEditorExternalLayerTarget(target: EventTarget | null) {
  if (!hasDom() || !(target instanceof Element)) return false

  return !!target.closest(MD_EDITOR_EXTERNAL_LAYER_SELECTOR)
}