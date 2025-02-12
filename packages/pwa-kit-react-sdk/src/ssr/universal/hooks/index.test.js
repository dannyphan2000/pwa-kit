const mockFunc = jest.fn();
const mockSetIsBlocked = jest.fn();
const mockUseHistory = {
  block: jest.fn(),
  push: jest.fn(),
  location: {},
};
const mockUseRef = { current: null };
const mockUseEffect = jest.fn();

describe('useBlock', () => {
  beforeEach(() => {
    mockFunc.mockReset();
    mockSetIsBlocked.mockReset();
    mockUseHistory.block.mockReset();
    mockUseHistory.push.mockReset();
    mockUseRef.current = null;
    mockUseEffect.mockReset();
    mockUseEffect.mockImplementation((callback) => callback());
  });

  it('should block when function returns true', async () => {
    mockFunc.mockResolvedValueOnce(true);
    useBlock(mockFunc, mockSetIsBlocked, mockUseHistory, mockUseRef, mockUseEffect);

    await Promise.resolve();

    expect(mockUseHistory.block).toHaveBeenCalled();
  });

  it('should not block when function returns false', async () => {
    mockFunc.mockResolvedValueOnce(false);
    useBlock(mockFunc, mockSetIsBlocked, mockUseHistory, mockUseRef, mockUseEffect);

    await Promise.resolve();

    expect(mockUseHistory.block).not.toHaveBeenCalled();
  });
});