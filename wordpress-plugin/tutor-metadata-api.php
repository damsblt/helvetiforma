<?php
/**
 * Plugin Name: Tutor LMS Metadata API
 * Description: Expose TutorLMS lesson metadata including exercise files via REST API
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class TutorMetadataAPI {
    
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    public function register_routes() {
        // Register route for lesson metadata
        register_rest_route('tutor/v1', '/lesson-metadata/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_lesson_metadata'),
            'permission_callback' => '__return_true',
            'args' => array(
                'id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
            ),
        ));
    }
    
    public function get_lesson_metadata($request) {
        $lesson_id = $request->get_param('id');
        
        // Get all post meta for this lesson
        $all_meta = get_post_meta($lesson_id);
        
        // Filter for TutorLMS related meta
        $tutor_meta = array();
        $exercise_files = array();
        
        foreach ($all_meta as $key => $value) {
            if (strpos($key, 'tutor_') === 0) {
                $tutor_meta[$key] = $value[0];
                
                // Look for exercise files in various meta fields
                if (in_array($key, array(
                    'tutor_lesson_exercise_files',
                    'tutor_lesson_files',
                    'tutor_attachments',
                    'tutor_exercise_files',
                    'tutor_lesson_attachments'
                ))) {
                    $files = maybe_unserialize($value[0]);
                    if (is_array($files) && !empty($files)) {
                        $exercise_files = array_merge($exercise_files, $files);
                    }
                }
            }
        }
        
        // Process exercise files
        $processed_files = array();
        if (!empty($exercise_files)) {
            foreach ($exercise_files as $index => $file) {
                if (is_string($file)) {
                    // If it's a URL string
                    $processed_files[] = array(
                        'id' => $index + 1,
                        'title' => basename($file),
                        'url' => $file,
                        'mime_type' => $this->get_mime_type($file),
                        'file_size' => 0,
                        'description' => '',
                        'alt_text' => '',
                    );
                } elseif (is_array($file) && isset($file['url'])) {
                    // If it's an array with URL
                    $processed_files[] = array(
                        'id' => isset($file['id']) ? $file['id'] : $index + 1,
                        'title' => isset($file['title']) ? $file['title'] : basename($file['url']),
                        'url' => $file['url'],
                        'mime_type' => isset($file['mime_type']) ? $file['mime_type'] : $this->get_mime_type($file['url']),
                        'file_size' => isset($file['file_size']) ? $file['file_size'] : 0,
                        'description' => isset($file['description']) ? $file['description'] : '',
                        'alt_text' => isset($file['alt_text']) ? $file['alt_text'] : '',
                    );
                }
            }
        }
        
        return array(
            'lesson_id' => $lesson_id,
            'tutor_metadata' => $tutor_meta,
            'exercise_files' => $processed_files,
            'raw_meta' => $all_meta, // For debugging
        );
    }
    
    private function get_mime_type($url) {
        $extension = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION);
        
        $mime_types = array(
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'zip' => 'application/zip',
            'rar' => 'application/x-rar-compressed',
            'mp4' => 'video/mp4',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
        );
        
        return isset($mime_types[strtolower($extension)]) ? $mime_types[strtolower($extension)] : 'application/octet-stream';
    }
}

// Initialize the plugin
new TutorMetadataAPI();

