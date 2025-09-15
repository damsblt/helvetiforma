import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create a simple registration form
    const formHtml = createRegistrationForm();

    return NextResponse.json({
      success: true,
      form_html: formHtml,
      page_title: 'Inscription Apprenant',
      page_url: '/inscription-apprenant',
      page_id: null
    });

  } catch (error) {
    console.error('Error fetching registration form:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch registration form',
        form_html: createRegistrationForm()
      },
      { status: 500 }
    );
  }
}

// Create a simple registration form
function createRegistrationForm(): string {
  return `
    <form id="tutor-registration-form" class="tutor-registration-form" method="post" action="/api/tutor-register">
      <div class="tutor-form-group">
        <label for="first_name">Prénom *</label>
        <input type="text" id="first_name" name="first_name" required>
      </div>
      
      <div class="tutor-form-group">
        <label for="last_name">Nom *</label>
        <input type="text" id="last_name" name="last_name" required>
      </div>
      
      <div class="tutor-form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" name="email" required>
      </div>
      
      <div class="tutor-form-group">
        <button type="submit" class="tutor-btn tutor-btn-primary">
          S'inscrire
        </button>
      </div>
    </form>
    
    <style>
      .tutor-registration-form {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #fff;
      }
      
      .tutor-form-group {
        margin-bottom: 20px;
      }
      
      .tutor-form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
      }
      
      .tutor-form-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }
      
      .tutor-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        text-decoration: none;
        display: inline-block;
        text-align: center;
      }
      
      .tutor-btn-primary {
        background-color: #3e64de;
        color: white;
        width: 100%;
      }
      
      .tutor-btn-primary:hover {
        background-color: #395bca;
      }
    </style>
  `;
}
