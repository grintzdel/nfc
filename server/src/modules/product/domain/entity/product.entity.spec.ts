import { ProductEntity } from './product.entity'

describe('ProductEntity', () => {
  it('should create a product with defaults', () => {
    const product = ProductEntity.create({ name: 'PULSE Classic', price: 29.99 })

    expect(product.name).toBe('PULSE Classic')
    expect(product.price).toBe(29.99)
    expect(product.slug).toBe('pulse-classic')
    expect(product.category).toBe('bracelet')
    expect(product.stock).toBe(0)
    expect(product.featured).toBe(false)
    expect(product.deletedAt).toBeNull()
  })

  it('should throw if name is missing', () => {
    expect(() => ProductEntity.create({ price: 10 })).toThrow('Product name is required')
  })

  it('should decrement stock', () => {
    const product = ProductEntity.create({ name: 'Test', price: 10, stock: 5 })
    product.decrementStock(3)
    expect(product.stock).toBe(2)
  })

  it('should throw on insufficient stock', () => {
    const product = ProductEntity.create({ name: 'Test', price: 10, stock: 2 })
    expect(() => product.decrementStock(5)).toThrow('Insufficient stock')
  })

  it('should soft delete', () => {
    const product = ProductEntity.create({ name: 'Test', price: 10 })
    expect(product.isDeleted()).toBe(false)
    product.softDelete()
    expect(product.isDeleted()).toBe(true)
    expect(product.deletedAt).not.toBeNull()
  })

  it('should update properties', () => {
    const product = ProductEntity.create({ name: 'Old', price: 10 })
    product.update({ name: 'New', price: 20, featured: true })
    expect(product.name).toBe('New')
    expect(product.price).toBe(20)
    expect(product.featured).toBe(true)
  })

  it('should serialize to JSON', () => {
    const product = ProductEntity.create({ name: 'Test', price: 10 })
    const json = product.toJSON()
    expect(json.name).toBe('Test')
    expect(json.price).toBe(10)
  })
})
