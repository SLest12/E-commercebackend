const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// Get all products
 // Find all products
  // Include its associated Category and Tag data

router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
  
      include: [{model: Category},{model: Tag,through: ProductTag}],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});
  

// get one product
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      // JOIN with travellers, using the Trip through table

      include: [{model: Category},{model: Tag,through: ProductTag}]
        });

    if (!productData) {
      res.status(404).json({ message: 'No product found !' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});


// create new product

  router.post('/', async (req, res) => {
    try {
      const productData = await Product.create(req.body);
      res.status(200).json(productData);
    } catch (err) {
      res.status(400).json(err);
    }
  
  
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */

});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});


  // delete one product by its `id` value
  router.delete('/:id', async (req, res) => {
    try {
      const productData = await Product.destroy({
        where: {
          id: req.params.id,
        },
      });
  
      if (!productData) {
        res.status(404).json({ message: 'No product found with that id!' });
        return;
      }
  
      res.status(200).json(productData);
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;
