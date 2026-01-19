import * as SecureStore from 'expo-secure-store'

const REFRESH_TOKEN_KEY = 'avolice.refreshToken'

export async function getRefreshToken(): Promise<string | null> {
	return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
}

export async function setRefreshToken(token: string): Promise<void> {
	await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
}

export async function clearRefreshToken(): Promise<void> {
	await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
}
