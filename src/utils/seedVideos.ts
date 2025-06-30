import { supabase } from '../lib/supabase';

// Default videos to seed into the database
const defaultVideos = [
  {
    title: 'Cinematic Masterpiece',
    url: 'https://www.youtube.com/embed/t9gqtyhL2m8',
    category: 'Short Films',
    description: 'Een cinematografisch meesterwerk dat de grenzen van visuele storytelling verkent. Elke scene is zorgvuldig gecomponeerd om emotie en betekenis over te brengen.',
    year: 2024
  },
  {
    title: 'Visual Storytelling',
    url: 'https://www.youtube.com/embed/F6fHfOSRwSw',
    category: 'Documentaries',
    description: 'Een documentaire die de kunst van visueel verhalen vertellen onderzoekt. Door geavanceerde camera technieken ontstaat een unieke kijkervaring.',
    year: 2024
  },
  {
    title: 'Creative Vision',
    url: 'https://www.youtube.com/embed/FBI42hpID5g',
    category: 'Music Videos',
    description: 'Een creatieve verkenning van muziek en beelden. Dit werk toont hoe geluid en beeld samen een krachtig verhaal kunnen vertellen.',
    year: 2024
  },
  {
    title: 'Artistic Expression',
    url: 'https://www.youtube.com/embed/y8zNisqRZj4',
    category: 'Commercials',
    description: 'Commercieel werk met artistieke flair. Een perfecte balans tussen commerciële doelstellingen en creatieve expressie.',
    year: 2024
  },
  {
    title: 'Emotional Journey',
    url: 'https://www.youtube.com/embed/1XrIUf_UaxY',
    category: 'Short Films',
    description: 'Een emotionele reis die de kijker meeneemt door verschillende gevoelsstaten. Cinematografie als emotionele taal.',
    year: 2024
  },
  {
    title: 'Behind the Lens',
    url: 'https://www.youtube.com/embed/E2IYfaOW0vI',
    category: 'Documentaries',
    description: 'Een blik achter de camera. Dit werk toont het creatieve proces en de passie achter elke opname.',
    year: 2024
  }
];

export async function seedDefaultVideos() {
  try {
    console.log('🎬 Starting to seed default videos...');
    
    // Check if videos already exist
    const { data: existingVideos, error: checkError } = await supabase
      .from('videos')
      .select('id')
      .limit(1);
    
    if (checkError) {
      throw checkError;
    }
    
    // If videos already exist, don't seed
    if (existingVideos && existingVideos.length > 0) {
      console.log('✅ Videos already exist in database, skipping seed');
      return { success: true, message: 'Videos already exist' };
    }
    
    // Insert default videos
    const { data, error } = await supabase
      .from('videos')
      .insert(defaultVideos)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Successfully seeded ${data?.length || 0} videos to database`);
    return { 
      success: true, 
      message: `Successfully added ${data?.length || 0} videos to database`,
      data 
    };
    
  } catch (error) {
    console.error('❌ Error seeding videos:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function clearAllVideos() {
  try {
    console.log('🗑️ Clearing all videos from database...');
    
    const { error } = await supabase
      .from('videos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)
    
    if (error) {
      throw error;
    }
    
    console.log('✅ All videos cleared from database');
    return { success: true, message: 'All videos cleared' };
    
  } catch (error) {
    console.error('❌ Error clearing videos:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}