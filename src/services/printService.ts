export function triggerPrint(): void {
  window.print();
}

export function preparePrintMode(): void {
  document.body.classList.add('printing-worksheet');
}

export function exitPrintMode(): void {
  document.body.classList.remove('printing-worksheet');
}
