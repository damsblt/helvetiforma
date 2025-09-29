import { NextRequest, NextResponse } from 'next/server'
import { getAllPageSlugs, getPageContent, updatePageContent } from '@/lib/content-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (slug) {
      // Récupérer une page spécifique
      const page = await getPageContent(slug)
      
      if (!page) {
        return NextResponse.json(
          {
            success: false,
            error: 'Page not found',
            message: `Page with slug '${slug}' does not exist`
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: page
      })
    } else {
      // Récupérer la liste de toutes les pages
      const slugs = getAllPageSlugs()
      
      // Charger les métadonnées de chaque page
      const pages = await Promise.all(
        slugs.map(async (slug) => {
          const page = await getPageContent(slug)
          return page ? {
            slug: page.slug,
            title: page.title,
            description: page.description,
          } : null
        })
      )
      
      const validPages = pages.filter(Boolean)
      
      return NextResponse.json({
        success: true,
        data: validPages,
        count: validPages.length
      })
    }
  } catch (error) {
    console.error('API Error - Content pages:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pages',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données requises
    const requiredFields = ['slug', 'title', 'description', 'content']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
            message: `The field '${field}' is required to create a page`
          },
          { status: 400 }
        )
      }
    }

    // Vérifier que la page n'existe pas déjà
    const existingPage = await getPageContent(body.slug)
    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page already exists',
          message: `A page with slug '${body.slug}' already exists`
        },
        { status: 409 }
      )
    }

    // Créer la nouvelle page
    await updatePageContent(body.slug, {
      slug: body.slug,
      title: body.title,
      description: body.description,
      content: body.content,
      seo: body.seo,
      hero: body.hero,
      sections: body.sections,
    })

    // Récupérer la page créée pour la retourner
    const createdPage = await getPageContent(body.slug)
    
    return NextResponse.json({
      success: true,
      data: createdPage,
      message: 'Page created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('API Error - Create page:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create page',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données requises
    if (!body.slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing slug',
          message: 'The slug field is required to update a page'
        },
        { status: 400 }
      )
    }

    // Vérifier que la page existe
    const existingPage = await getPageContent(body.slug)
    if (!existingPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page not found',
          message: `Page with slug '${body.slug}' does not exist`
        },
        { status: 404 }
      )
    }

    // Mettre à jour la page avec les nouvelles données
    const updatedPageData = {
      slug: body.slug,
      title: body.title || existingPage.title,
      description: body.description || existingPage.description,
      content: body.content || existingPage.content,
      seo: body.seo || existingPage.seo,
      hero: body.hero || existingPage.hero,
      sections: body.sections || existingPage.sections,
    }

    await updatePageContent(body.slug, updatedPageData)

    // Récupérer la page mise à jour pour la retourner
    const updatedPage = await getPageContent(body.slug)
    
    return NextResponse.json({
      success: true,
      data: updatedPage,
      message: 'Page updated successfully'
    })
  } catch (error) {
    console.error('API Error - Update page:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update page',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
