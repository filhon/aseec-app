/**
 * Google Drive URL utilities
 * Converts sharing links into embeddable/viewable URLs without using the API.
 */

export type DriveFileType = 'image' | 'video' | 'document'

export interface DriveFile {
    id: string
    type: DriveFileType
    previewUrl: string
    thumbnailUrl: string
    originalUrl: string
    title: string
}

/**
 * Extracts the file ID from a Google Drive share URL.
 * Supports:
 *   - https://drive.google.com/file/d/FILE_ID/view
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://docs.google.com/document/d/FILE_ID/...
 *   - https://docs.google.com/spreadsheets/d/FILE_ID/...
 *   - https://docs.google.com/presentation/d/FILE_ID/...
 */
export function extractDriveId(url: string): string | null {
    try {
        const parsed = new URL(url)

        // drive.google.com/file/d/ID/view
        const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
        if (fileMatch) return fileMatch[1]

        // docs.google.com/document|spreadsheets|presentation/d/ID
        const docsMatch = parsed.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)
        if (docsMatch) return docsMatch[1]

        // drive.google.com/open?id=ID
        const idParam = parsed.searchParams.get('id')
        if (idParam) return idParam

        return null
    } catch {
        return null
    }
}

/**
 * Auto-detects type from URL patterns:
 * - docs.google.com/document  → document
 * - docs.google.com/spreadsheets → document
 * - docs.google.com/presentation → document
 * - drive.google.com/file/d → null (unknown, user must select)
 */
export function detectDriveType(url: string): DriveFileType | null {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname
        const path = parsed.pathname

        if (host === 'docs.google.com') {
            if (path.startsWith('/document')) return 'document'
            if (path.startsWith('/spreadsheets')) return 'document'
            if (path.startsWith('/presentation')) return 'document'
            if (path.startsWith('/forms')) return 'document'
        }

        return null // generic drive file — user must pick type
    } catch {
        return null
    }
}

/**
 * Returns true if the URL looks like a valid Google Drive/Docs link.
 */
export function isDriveUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.hostname === 'drive.google.com' || parsed.hostname === 'docs.google.com'
    } catch {
        return false
    }
}

/**
 * Builds the display/embed URLs for a Drive file given its type.
 */
export function buildDriveUrls(id: string, type: DriveFileType) {
    return {
        // Used for previewing images directly
        imageUrl: `https://lh3.googleusercontent.com/d/${id}`,
        // Used for embedding video / doc previews (via iframe)
        iframeUrl: `https://drive.google.com/file/d/${id}/preview`,
        // Used as fallback thumbnail
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w400`,
        // Opens in browser
        viewUrl: `https://drive.google.com/file/d/${id}/view`,
    }
}

/**
 * Full parser: given a raw URL + optional user-selected type,
 * returns a DriveFile ready to be stored / displayed.
 */
export function parseDriveLink(url: string, typeOverride?: DriveFileType, title?: string): DriveFile | null {
    const id = extractDriveId(url)
    if (!id) return null

    const type = typeOverride ?? detectDriveType(url) ?? 'document'
    const urls = buildDriveUrls(id, type)

    let previewUrl: string
    let thumbnailUrl: string

    if (type === 'image') {
        previewUrl = urls.imageUrl
        thumbnailUrl = urls.imageUrl
    } else if (type === 'video') {
        previewUrl = urls.iframeUrl
        thumbnailUrl = urls.thumbnailUrl
    } else {
        previewUrl = urls.iframeUrl
        thumbnailUrl = urls.thumbnailUrl
    }

    return {
        id,
        type,
        previewUrl,
        thumbnailUrl,
        originalUrl: url,
        title: title || `Arquivo do Drive`,
    }
}
