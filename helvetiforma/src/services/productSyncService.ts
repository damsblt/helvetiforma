import { wooCommerceService } from './woocommerceService';
import { tutorLmsService } from './tutorLmsService';

export interface CourseProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  courseId: number;
  duration: string;
  level: string;
  instructor: string;
  image: string;
  virtual: boolean;
  downloadable: boolean;
}

export class ProductSyncService {
  /**
   * Sync all TutorLMS courses to WooCommerce products
   */
  async syncAllCoursesToProducts(): Promise<{ success: number; errors: number }> {
    try {
      console.log('Starting course synchronization...');
      
      // Get all courses from TutorLMS
      const courses = await tutorLmsService.getCourses();
      console.log(`Found ${courses.length} courses to sync`);

      let successCount = 0;
      let errorCount = 0;

      for (const course of courses) {
        try {
          await this.syncCourseToProduct(course);
          successCount++;
          console.log(`✅ Synced course: ${course.title}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to sync course ${course.title}:`, error);
        }
      }

      console.log(`Synchronization completed: ${successCount} success, ${errorCount} errors`);
      return { success: successCount, errors: errorCount };

    } catch (error) {
      console.error('Error syncing courses to products:', error);
      throw error;
    }
  }

  /**
   * Sync a single course to WooCommerce product
   */
  async syncCourseToProduct(course: any): Promise<any> {
    try {
      // Check if product already exists
      const existingProducts = await wooCommerceService.getProducts({
        search: course.title,
        per_page: 10
      });

      const existingProduct = existingProducts.find((product: any) => 
        product.meta_data?.some((meta: any) => 
          meta.key === '_tutor_course_id' && meta.value === course.id.toString()
        )
      );

      const productData = {
        name: course.title,
        type: 'simple',
        status: 'publish',
        virtual: true,
        downloadable: true,
        regular_price: course.price?.toString() || '0',
        description: course.description || course.excerpt || '',
        short_description: course.excerpt || course.description?.substring(0, 160) || '',
        images: course.featured_image ? [{
          src: course.featured_image,
          alt: course.title
        }] : [],
        meta_data: [
          { key: '_tutor_course_id', value: course.id.toString() },
          { key: '_tutor_product', value: 'yes' },
          { key: '_course_duration', value: course.duration || course.meta?.course_duration || '3 jours' },
          { key: '_course_level', value: course.level || course.meta?.course_level || 'Intermédiaire' },
          { key: '_course_instructor', value: course.instructor || course.meta?.course_instructor || 'Formateur certifié' },
          { key: '_course_type', value: course.type || course.meta?.course_type || 'présentiel' },
          { key: '_course_certificate', value: course.certificate ? 'true' : course.meta?.course_certificate || 'Oui' },
          { key: '_course_slug', value: course.slug || course.title.toLowerCase().replace(/\s+/g, '-') },
          { key: '_course_language', value: course.meta?.course_language || 'Français' },
          { key: '_course_rating', value: (course.meta?.course_rating || 0).toString() },
          { key: '_course_rating_count', value: (course.meta?.course_rating_count || 0).toString() },
          { key: '_course_price_type', value: course.meta?.course_price_type || 'paid' }
        ],
        categories: [
          {
            id: await this.getOrCreateCategory('Formations')
          }
        ],
        tags: this.generateCourseTags(course),
        manage_stock: true,
        stock_quantity: course.capacity || 20,
        backorders: 'no',
        sold_individually: false,
        weight: '0',
        dimensions: {
          length: '0',
          width: '0',
          height: '0'
        },
        shipping_class: '',
        reviews_allowed: true,
        upsell_ids: [],
        cross_sell_ids: [],
        purchase_note: 'Merci pour votre inscription! Vous recevrez un email de confirmation avec les détails de votre formation.',
        menu_order: 0
      };

      // Add array-based course attributes as meta entries
      if (Array.isArray(course.meta?.course_benefits) && course.meta.course_benefits.length > 0) {
        productData.meta_data.push({
          key: '_course_benefits',
          value: JSON.stringify(course.meta.course_benefits)
        });
      }

      if (Array.isArray(course.meta?.course_requirements) && course.meta.course_requirements.length > 0) {
        productData.meta_data.push({
          key: '_course_requirements',
          value: JSON.stringify(course.meta.course_requirements)
        });
      }

      if (Array.isArray(course.meta?.course_target_audience) && course.meta.course_target_audience.length > 0) {
        productData.meta_data.push({
          key: '_course_target_audience',
          value: JSON.stringify(course.meta.course_target_audience)
        });
      }

      if (Array.isArray(course.meta?.course_material_includes) && course.meta.course_material_includes.length > 0) {
        productData.meta_data.push({
          key: '_course_material_includes',
          value: JSON.stringify(course.meta.course_material_includes)
        });
      }

      if (Array.isArray(course.meta?.course_categories) && course.meta.course_categories.length > 0) {
        productData.meta_data.push({
          key: '_course_categories',
          value: JSON.stringify(course.meta.course_categories)
        });
      }

      if (Array.isArray(course.meta?.course_tags) && course.meta.course_tags.length > 0) {
        productData.meta_data.push({
          key: '_course_tags',
          value: JSON.stringify(course.meta.course_tags)
        });
      }

      if (existingProduct) {
        // Update existing product
        console.log(`Updating existing product for course: ${course.title}`);
        return await wooCommerceService.updateProduct(existingProduct.id, productData);
      } else {
        // Create new product
        console.log(`Creating new product for course: ${course.title}`);
        return await wooCommerceService.createProduct(productData);
      }

    } catch (error) {
      console.error(`Error syncing course ${course.title} to product:`, error);
      throw error;
    }
  }

  /**
   * Sync WooCommerce product back to TutorLMS course
   */
  async syncProductToCourse(product: any): Promise<any> {
    try {
      const courseId = product.meta_data?.find((meta: any) => 
        meta.key === '_tutor_course_id'
      )?.value;

      if (!courseId) {
        throw new Error('Product is not linked to a course');
      }

      // Get course data from TutorLMS
      const course = await tutorLmsService.getCourse(parseInt(courseId));
      
      // Update course with product data
      const updatedCourseData = {
        title: product.name,
        content: product.description,
        excerpt: product.short_description,
        price: parseFloat(product.regular_price),
        featured_image: product.images?.[0]?.src || '',
        status: product.status === 'publish' ? 'publish' : 'draft'
      };

      // Update course in TutorLMS
      // TODO: Implement updateCourse method in TutorLmsService
      // return await tutorLmsService.updateCourse(parseInt(courseId), updatedCourseData);
      return { success: true, message: 'Course update not implemented yet' };

    } catch (error) {
      console.error(`Error syncing product ${product.name} to course:`, error);
      throw error;
    }
  }

  /**
   * Get or create WooCommerce category
   */
  private async getOrCreateCategory(categoryName: string): Promise<number> {
    try {
      const categories = await wooCommerceService.getCategories({
        search: categoryName
      });

      const existingCategory = categories.find((cat: any) => 
        cat.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (existingCategory) {
        return existingCategory.id;
      }

      // Create new category
      const newCategory = await wooCommerceService.createCategory({
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
        description: `Catégorie pour ${categoryName}`,
        parent: 0
      });

      return newCategory.id;

    } catch (error) {
      console.error(`Error getting/creating category ${categoryName}:`, error);
      return 0; // Default category ID
    }
  }

  /**
   * Generate tags for course based on content
   */
  private generateCourseTags(course: any): Array<{ name: string; slug: string }> {
    const tags = [];
    
    // Add level tag
    if (course.level) {
      tags.push({
        name: course.level,
        slug: course.level.toLowerCase().replace(/\s+/g, '-')
      });
    }

    // Add type tag
    if (course.type) {
      tags.push({
        name: course.type,
        slug: course.type.toLowerCase().replace(/\s+/g, '-')
      });
    }

    // Add duration tag
    if (course.duration) {
      tags.push({
        name: course.duration,
        slug: course.duration.toLowerCase().replace(/\s+/g, '-')
      });
    }

    // Add certificate tag if available
    if (course.certificate) {
      tags.push({
        name: 'Certificat',
        slug: 'certificat'
      });
    }

    return tags;
  }

  /**
   * Validate product-course sync
   */
  async validateSync(): Promise<{
    valid: number;
    invalid: number;
    issues: Array<{ productId: number; courseId: number; issue: string }>;
  }> {
    try {
      const products = await wooCommerceService.getProducts({
        per_page: 100
      });

      const courseProducts = products.filter((product: any) => 
        product.meta_data?.some((meta: any) => 
          meta.key === '_tutor_product' && meta.value === 'yes'
        )
      );

      let valid = 0;
      let invalid = 0;
      const issues: Array<{ productId: number; courseId: number; issue: string }> = [];

      for (const product of courseProducts) {
        const courseId = product.meta_data?.find((meta: any) => 
          meta.key === '_tutor_course_id'
        )?.value;

        if (!courseId) {
          invalid++;
          issues.push({
            productId: product.id,
            courseId: 0,
            issue: 'Missing course ID'
          });
          continue;
        }

        try {
          const course = await tutorLmsService.getCourse(parseInt(courseId));
          if (course) {
            valid++;
          } else {
            invalid++;
            issues.push({
              productId: product.id,
              courseId: parseInt(courseId),
              issue: 'Course not found'
            });
          }
        } catch (error) {
          invalid++;
          issues.push({
            productId: product.id,
            courseId: parseInt(courseId),
            issue: 'Course access error'
          });
        }
      }

      return { valid, invalid, issues };

    } catch (error) {
      console.error('Error validating sync:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productSyncService = new ProductSyncService();
