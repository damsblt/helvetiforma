const TUTOR_API_URL = 'https://api.helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'L6Mr kZYj rqIc fMhE ex89 LMqP';

const auth = `Basic ${Buffer.from(`gibivawa:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`;

async function createTopic(courseId, title, summary) {
  try {
    const response = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: JSON.stringify({
        topic_course_id: courseId,
        topic_title: title,
        topic_summary: summary,
        topic_author: 1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating topic:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('Topic created:', data);
    return data.data || data;
  } catch (error) {
    console.error('Error creating topic:', error);
    return null;
  }
}

async function createLesson(topicId, title, content, video = null) {
  try {
    const lessonData = {
      topic_id: topicId,
      lesson_title: title,
      lesson_content: content,
      lesson_author: 1
    };

    if (video) {
      lessonData.video = video;
    }

    const response = await fetch(`${TUTOR_API_URL}/wp-json/tutor/v1/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating lesson:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('Lesson created:', data);
    return data.data || data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    return null;
  }
}

async function populateCourse() {
  const courseId = 24; // Gestion des Salaires

  console.log('Creating topics for course', courseId);

  // Create topics
  const topic1 = await createTopic(
    courseId,
    'Introduction à la Gestion des Salaires',
    'Comprendre les bases de la gestion des salaires et les obligations légales'
  );

  const topic2 = await createTopic(
    courseId,
    'Calcul des Salaires Bruts et Nets',
    'Apprendre à calculer les salaires bruts et nets selon la législation suisse'
  );

  const topic3 = await createTopic(
    courseId,
    'Charges Sociales et Cotisations',
    'Maîtriser le calcul des charges sociales et des cotisations obligatoires'
  );

  if (topic1) {
    console.log('Creating lessons for topic 1...');
    
    await createLesson(
      topic1.id,
      'Les Bases de la Gestion des Salaires',
      '<h2>Introduction</h2><p>La gestion des salaires est un aspect crucial de la gestion des ressources humaines. Ce cours vous permettra de maîtriser tous les aspects de la gestion des salaires en Suisse.</p><h3>Objectifs d\'apprentissage</h3><ul><li>Comprendre la législation suisse sur les salaires</li><li>Maîtriser le calcul des salaires bruts et nets</li><li>Connaître les charges sociales obligatoires</li></ul>',
      {
        source_type: 'youtube',
        source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        runtime: {
          hours: '00',
          minutes: '05',
          seconds: '30'
        }
      }
    );

    await createLesson(
      topic1.id,
      'Obligations Légales',
      '<h2>Obligations Légales</h2><p>En Suisse, la gestion des salaires est encadrée par plusieurs lois et ordonnances.</p><h3>Lois Applicables</h3><ul><li>Code des obligations (CO)</li><li>Loi sur le travail (LTr)</li><li>Ordonnance sur la protection des travailleurs (OPTr)</li></ul>'
    );
  }

  if (topic2) {
    console.log('Creating lessons for topic 2...');
    
    await createLesson(
      topic2.id,
      'Calcul du Salaire Brut',
      '<h2>Calcul du Salaire Brut</h2><p>Le salaire brut est la base de tous les calculs. Il comprend le salaire de base plus les éventuelles primes et indemnités.</p><h3>Formule de Base</h3><p>Salaire Brut = Salaire de Base + Primes + Indemnités</p>',
      {
        source_type: 'youtube',
        source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        runtime: {
          hours: '00',
          minutes: '08',
          seconds: '15'
        }
      }
    );

    await createLesson(
      topic2.id,
      'Calcul du Salaire Net',
      '<h2>Calcul du Salaire Net</h2><p>Le salaire net est ce que l\'employé reçoit réellement après déduction de toutes les charges.</p><h3>Déductions Obligatoires</h3><ul><li>AVS/AI/APG</li><li>Assurance chômage</li><li>Prévoyance professionnelle</li><li>Impôt à la source</li></ul>'
    );
  }

  if (topic3) {
    console.log('Creating lessons for topic 3...');
    
    await createLesson(
      topic3.id,
      'AVS, AI et APG',
      '<h2>Assurance Vieillesse et Survivants (AVS)</h2><p>L\'AVS est l\'assurance sociale de base en Suisse.</p><h3>Taux de Cotisation</h3><p>Employeur: 5.3%<br>Employé: 5.3%<br>Total: 10.6%</p>',
      {
        source_type: 'youtube',
        source: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        runtime: {
          hours: '00',
          minutes: '12',
          seconds: '45'
        }
      }
    );

    await createLesson(
      topic3.id,
      'Assurance Chômage',
      '<h2>Assurance Chômage (AC)</h2><p>L\'assurance chômage protège les travailleurs en cas de perte d\'emploi.</p><h3>Taux de Cotisation</h3><p>Employeur: 1.1%<br>Employé: 1.1%<br>Total: 2.2%</p>'
    );
  }

  console.log('Course content populated successfully!');
}

populateCourse().catch(console.error);
