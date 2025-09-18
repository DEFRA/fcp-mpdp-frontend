export default {
  init () {
    const printLink = document.getElementById('print-link')

    printLink?.addEventListener('click', (e) => {
      e.preventDefault()
      console.log('---------------- print link was clicked')
      window.print()
    })
  }
}
