import { CategoryModel } from './models/categoryModel';
import { PostModel } from './models/postModel';
import { Database } from './config/database';

async function runCategoryTests() {
  console.log('=== MODERNBLOG CMS — CATEGORY IMAGE SYSTEM TEST SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Create Top-Level Category with Image
    console.log('--- 1. Testing Category Creation with Image & Hierarchy ---');
    const parentCat = await CategoryModel.createCategory({
      name: 'Software Engineering 2026',
      slug: 'software-engineering-2026',
      description: 'Comprehensive software development, architecture, and engineering principles.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
    });

    assert(parentCat !== null && parentCat.category_id > 0, 'Parent category created with ID');
    assert(parentCat.image === 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', 'Category image stored correctly');
    assert(parentCat.image_url === 'https://images.unsplash.com/photo-1555066931-4365d14bab8c', 'Category image_url alias mapped');

    // 2. Create Subcategory
    const subCat = await CategoryModel.createCategory({
      name: 'Cloud Computing & DevOps',
      slug: 'cloud-computing-devops',
      description: 'Serverless architectures, Kubernetes, and Oracle Cloud deployments.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
      parent_id: parentCat.category_id,
    });

    assert(subCat !== null && subCat.parent_id === parentCat.category_id, 'Subcategory created with parent hierarchy link');

    // 3. Find By Slug & Hierarchy Resolution
    console.log('\n--- 2. Testing Category Retrieval by Slug ---');
    const fetchedSub = await CategoryModel.findBySlug('cloud-computing-devops');
    assert(fetchedSub !== null, 'Category retrieved by slug');
    assert(fetchedSub?.parent_category_name === 'Software Engineering 2026', 'Parent category name resolved in hierarchy');
    assert(fetchedSub?.image !== undefined, 'Category image present in fetched record');

    // 4. Edit Category Image & Update
    console.log('\n--- 3. Testing Category Image Editing ---');
    const updatedSub = await CategoryModel.updateCategory(subCat.category_id, {
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      description: 'Updated DevOps description with new image asset.',
    });

    assert(updatedSub?.image === 'https://images.unsplash.com/photo-1518770660439-4636190af475', 'Category image updated successfully');

    // 5. Remove Category Image (Fallback Test)
    console.log('\n--- 4. Testing Image Removal & Fallback Handling ---');
    const noImageSub = await CategoryModel.updateCategory(subCat.category_id, {
      image: null as any,
    });
    assert(!noImageSub?.image, 'Category image safely removed without breaking record');

    // 6. Safe Category Deletion (Verify Articles Are Not Deleted)
    console.log('\n--- 5. Testing Safe Category Deletion Article Protection ---');
    const store = Database.getStore();
    // Simulate an article in this category
    const initialPostCount = store.posts.length;
    const testPost = await PostModel.createPost({
      authorId: 1,
      categoryId: parentCat.category_id,
      title: 'Article in Category Deletion Safety Test',
      slug: 'safety-test-article-' + Date.now(),
      excerpt: 'Sample lead excerpt for safety test.',
      content: '<p>Test content to ensure article remains safe after category deletion.</p>',
      readingTime: 2,
      status: 'published',
    });

    assert(testPost !== null && testPost.category_id === parentCat.category_id, 'Test article created under category');

    // Delete the parent category
    await CategoryModel.deleteCategory(parentCat.category_id);
    const postAfterCatDelete = await PostModel.findById(testPost.post_id);
    assert(postAfterCatDelete !== null, 'Article was NOT deleted when category was deleted');
    assert(postAfterCatDelete?.category_name === 'General', 'Article safely reassigned to General fallback category');

    console.log(`\n===============================================================`);
    console.log(`CATEGORY SYSTEM TESTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Category test error:', err);
    process.exit(1);
  }
}

runCategoryTests();
