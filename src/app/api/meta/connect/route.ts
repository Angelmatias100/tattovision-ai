import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

/**
 * GET /api/meta/connect
 *
 * Initiates the Meta OAuth 2.0 flow by redirecting the user to the
 * Meta Login Dialog. On success, Meta will redirect back to:
 *   /api/meta/connect/callback?code=…&state=…
 *
 * Required scopes:
 *   - ads_management  — create/update campaigns, ad sets, ads
 *   - ads_read        — read campaign insights and performance data
 *   - business_management — access Business Manager assets
 *
 * Meta OAuth docs:
 * https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appId       = process.env.META_APP_ID
  const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'META_APP_ID or NEXT_PUBLIC_META_REDIRECT_URI is not configured' },
      { status: 500 }
    )
  }

  // Use the Clerk userId as the CSRF state so the callback can verify it
  const state = encodeURIComponent(userId)

  const scopes = [
    'ads_management',
    'ads_read',
    'business_management',
  ].join(',')

  const dialogUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth')
  dialogUrl.searchParams.set('client_id',     appId)
  dialogUrl.searchParams.set('redirect_uri',  redirectUri)
  dialogUrl.searchParams.set('scope',         scopes)
  dialogUrl.searchParams.set('response_type', 'code')
  dialogUrl.searchParams.set('state',         state)

  return NextResponse.redirect(dialogUrl.toString())
}
