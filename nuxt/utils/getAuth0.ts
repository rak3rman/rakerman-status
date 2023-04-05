import createAuth0Client from '@auth0/auth0-spa-js'

export const getAuth0 = async () => {
    // Import global config defined in nuxt.config.ts
    const config = useRuntimeConfig()
	// Create a new instance of Auth0 Client
	let auth = await createAuth0Client({
		domain: config.auth0.domain,
		client_id: config.auth0.client_id,
		redirect_uri: config.urlBase.front + config.auth0.redirect_url,
		cacheLocation: 'localstorage',
		audience: 'https://rakerman.us.auth0.com/api/v2/'
    })
	// Create isAuth, user, and token
	const isAuth = await auth.isAuthenticated()
	const user = isAuth ? await auth.getUser() : undefined
	const token = isAuth ? await auth.getTokenSilently() : undefined
	// Return
	return { auth, isAuth, user, token }
}
