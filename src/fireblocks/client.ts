
import { Fireblocks, BasePath } from '@fireblocks/ts-sdk'
import 'dotenv/config'

// Initialize a Fireblocks API instance with local variables
const fc = new Fireblocks({
    basePath: BasePath.US,
    apiKey: process.env.FIREBLOCKS_API_KEY,
    secretKey: process.env.FIREBLOCKS_SECRET,
})

// Initialize a Fireblocks API instance with local variables
export const whitelister = new Fireblocks({
    basePath: BasePath.US,
    apiKey: process.env.FIREBLOCKS_WHITELIST_KEY,
    secretKey: process.env.FIREBLOCKS_SECRET,
})

export default fc