// TODO: move these unit tests to ApplicationExtension.test.tsx
// import {CacheResult} from './cacheResult'

class TestClass {
  public _cachedValue: any
  public _cachedValueAsync: any

//   @CacheResult('_cachedValue')
  getValue(): string {
    return 'value'
  }

//   @CacheResult('_cachedValueAsync')
  async getValueAsync(): Promise<string> {
    return Promise.resolve('async value')
  }
}

describe('CacheResult', () => {
  let testInstance: TestClass

  beforeEach(() => {
    testInstance = new TestClass()
  })

  it('should cache the result of the method call', async () => {
    const result1 = testInstance.getValue()
    const result2 = testInstance.getValue()

    expect(result1).toBe('value')
    expect(result2).toBe('value')
    expect(testInstance['_cachedValue']).toBe('value')
  })

  it('should return the cached result on subsequent calls', async () => {
    testInstance['_cachedValue'] = 'cached value'

    const result = testInstance.getValue()

    expect(result).toBe('cached value')
  })

  it('should call the original method if the cache is not set', () => {
    const spy = jest.spyOn(testInstance, 'getValue')

    testInstance.getValue()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should cache the result of the async method call', async () => {
    const result1 = await testInstance.getValueAsync()
    const result2 = await testInstance.getValueAsync()

    expect(result1).toBe('async value')
    expect(result2).toBe('async value')
    expect(testInstance['_cachedValueAsync']).toBe('async value')
  })

  it('should return the cached result on subsequent async calls', async () => {
    testInstance['_cachedValueAsync'] = 'cached async value'

    const result = await testInstance.getValueAsync()

    expect(result).toBe('cached async value')
  })

  it('should call the original async method if the cache is not set', async () => {
    const spy = jest.spyOn(testInstance, 'getValueAsync')

    await testInstance.getValueAsync()

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
