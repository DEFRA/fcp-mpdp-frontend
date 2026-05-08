const GA_COOKIE_PREFIXES = ['_ga', '_gid', '_gat', '_dc_gtm_']

function buildDeletableDomains (hostname) {
  const domains = new Set()

  domains.add(hostname)
  domains.add('.' + hostname)

  const parts = hostname.split('.')

  for (let i = 1; i < parts.length - 1; i++) {
    domains.add('.' + parts.slice(i).join('.'))
  }

  return domains
}

function deleteGoogleAnalyticsCookies () {
  const allCookies = document.cookie.split(';')
  const hostname = window.location.hostname
  const domains = buildDeletableDomains(hostname)

  for (const cookie of allCookies) {
    const cookieName = cookie.split('=')[0].trim()
    const isGaCookie = GA_COOKIE_PREFIXES.some((prefix) => cookieName.startsWith(prefix))

    if (isGaCookie) {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`

      for (const domain of domains) {
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`
      }
    }
  }
}

function loadGoogleAnalytics (gtmKey) {
  if (!gtmKey) {
    return
  }

  const existingScript = document.querySelector('script[nonce]')
  const nonce = existingScript ? existingScript.getAttribute('nonce') : null

  const script = document.createElement('script')

  if (nonce) {
    script.setAttribute('nonce', nonce)
  }

  script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${gtmKey}');`

  document.head.appendChild(script)
}

export default {
  init () {
    this.setupCookieComponentListeners()
  },

  setupCookieComponentListeners () {
    const cookieContainer = document.querySelector('.js-cookies-container')

    if (!cookieContainer) {
      return
    }

    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const rejectButton = document.querySelector('.js-cookies-button-reject')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')
    const rejectedBanner = document.querySelector('.js-cookies-rejected')
    const cookieBanner = document.querySelector('.js-cookies-banner')

    const crumb = cookieContainer.dataset.crumb
    const gtmKey = cookieContainer.dataset.gtmKey

    const submitPreference = (accepted) => {
      const xhr = new XMLHttpRequest() // eslint-disable-line no-undef

      xhr.open('POST', '/cookies', true)

      xhr.setRequestHeader('Content-Type', 'application/json')

      xhr.send(JSON.stringify({
        analytics: accepted,
        async: true,
        crumb
      }))
    }

    const showBanner = (banner) => {
      const questionBanner = document.querySelector('.js-question-banner')
      questionBanner.setAttribute('hidden', 'hidden')
      banner.removeAttribute('hidden')
      banner.setAttribute('tabindex', '-1')
      banner.focus()

      banner.addEventListener('blur', () => {
        banner.removeAttribute('tabindex')
      })
    }

    acceptButton?.addEventListener('click', (event) => {
      event.preventDefault()
      showBanner(acceptedBanner)
      submitPreference(true)
      loadGoogleAnalytics(gtmKey)
    })

    rejectButton?.addEventListener('click', (event) => {
      event.preventDefault()
      showBanner(rejectedBanner)
      submitPreference(false)
      deleteGoogleAnalyticsCookies()
    })

    acceptedBanner?.querySelector('.js-hide').addEventListener('click', () => {
      cookieBanner.setAttribute('hidden', 'hidden')
    })

    rejectedBanner?.querySelector('.js-hide').addEventListener('click', () => {
      cookieBanner.setAttribute('hidden', 'hidden')
    })
  }
}
