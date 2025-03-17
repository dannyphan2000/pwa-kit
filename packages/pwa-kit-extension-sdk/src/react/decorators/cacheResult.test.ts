import {CacheResult} from './cacheResult'

class TestClass {
  public _cachedValue: any

  @CacheResult('_cachedValue')
getValue(): string {
    return 'value'
  }
}

describe('CacheResult', () => {
  let testInstance: TestClass

  beforeEach(() => {
    testInstance = new TestClass()
  })

  it('should cache the result of the method call', () => {
    const result1 = testInstance.getValue()
    const result2 = testInstance.getValue()

    expect(result1).toBe('value')
    expect(result2).toBe('value')
    expect(testInstance['_cachedValue']).toBe('value')
  })

  it('should return the cached result on subsequent calls', () => {
    testInstance['_cachedValue'] = 'cached value'

    const result = testInstance.getValue()

    expect(result).toBe('cached value')
  })

  it('should call the original method if the cache is not set', () => {
    const spy = jest.spyOn(testInstance, 'getValue')

    testInstance.getValue()

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
