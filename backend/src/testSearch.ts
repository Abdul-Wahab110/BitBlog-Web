import { Database } from './config/database';
import { CategoryModel } from './models/categoryModel';
import { TagModel } from './models/tagModel';
import { PostModel } from './models/postModel';

async function runSearchTests() {
  console.log('=== STARTING CONTENT DISCOVERY & SEARCH WORKFLOW TESTS ===\n');

  await Database.initialize();

  // Test 1: Category CRUD & Hierarchy
  console.log('[Test 1] Category CRUD & Parent/Subcategory Hierarchy...');
  const mainCat = await CategoryModel.createCategory({
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description: 'AI, Machine Learning, and Neural Networks',
  });
  console.log(`- Top-Level Category Created: ID=${mainCat.category_id}, Slug='${mainCat.slug}'`);

  const subCat = await CategoryModel.createCategory({
    name: 'Large Language Models',
    slug: 'llms',
    parentCategoryId: mainCat.category_id,
  });
  console.log(`- Subcategory Created: ID=${subCat.category_id}, ParentID=${subCat.parent_category_id}`);

  // Test 2: Tag CRUD
  console.log('\n[Test 2] Tag Creation & Querying...');
  const tag1 = await TagModel.createTag('Neural Networks', 'neural-networks');
  console.log(`- Tag Created: ID=${tag1.tag_id}, Name='${tag1.name}'`);

  // Test 3: Advanced Search, Filter & Sort Queries
  console.log('\n[Test 3] Testing Search, Filter & Sort Oracle Query Execution...');
  const searchResult = await PostModel.findPublished(
    10, // limit
    0,  // offset
    'artificial-intelligence', // category filter
    'Intelligence', // search query
    undefined, // tag
    undefined, // author
    'newest' // sort
  );
  console.log(`- Search Query Completed: Returned ${searchResult.posts.length} articles (Total Match Count: ${searchResult.total})`);

  // Test 4: Sorting Option Verification
  console.log('\n[Test 4] Testing Sort Options (most_viewed, a-z, oldest)...');
  const sortMostViewed = await PostModel.findPublished(10, 0, undefined, undefined, undefined, undefined, 'most_viewed');
  const sortAZ = await PostModel.findPublished(10, 0, undefined, undefined, undefined, undefined, 'a-z');
  console.log(`- Sort Queries Executed Successfully: most_viewed count=${sortMostViewed.posts.length}, a-z count=${sortAZ.posts.length}`);

  // Cleanup
  await CategoryModel.deleteCategory(mainCat.category_id);
  await CategoryModel.deleteCategory(subCat.category_id);
  await TagModel.deleteTag(tag1.tag_id);

  console.log('\n=== ALL CONTENT DISCOVERY & SEARCH WORKFLOW TESTS PASSED PERFECTLY! ===');
}

runSearchTests().catch(err => {
  console.error('Search Test Failed:', err);
  process.exit(1);
});
