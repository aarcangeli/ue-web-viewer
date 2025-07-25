import unittest

from utils import split_arguments


class TestMathUtils(unittest.TestCase):
    def test_split_arguments(self):
        self.assertEqual(
            split_arguments("a, b, c(1,2), d{1,2}"), ["a", "b", "c(1,2)", "d{1,2}"]
        )
        self.assertEqual(split_arguments('TEXT("a,b,c")'), ['TEXT("a,b,c")'])
        self.assertEqual(split_arguments('"a,b,c"'), ['"a,b,c"'])
        self.assertEqual(split_arguments('"a\\"b"'), ['"a\\"b"'])


if __name__ == "__main__":
    unittest.main()
