// AUTO-GENERATED practice content. Source: personal DSA solution artifacts.
// Java solutions with statement -> approach -> code -> complexity -> follow-ups.

export type Difficulty = "easy" | "med" | "hard";

export interface Problem {
  n: string;
  title: string;
  diff: Difficulty;
  lc: string;
  pat: string;
  statement: string;
  example: string;
  approach: string;
  code: string;
  tc: string;
  sc: string;
  followup: string;
}

export interface Category {
  id: string;
  name: string;
  meta: string;
  intro: string;
  problems: Problem[];
}

export interface Template {
  id: string;
  title: string;
  when: string;
  note: string;
  code: string;
}

export interface TemplateGroup {
  id: string;
  name: string;
  meta: string;
  intro: string;
  templates: Template[];
}

export const CATEGORIES: Category[] = [
  {
    "id": "arrays",
    "name": "Arrays & Strings",
    "meta": "most common · master first",
    "intro": "The highest-frequency category at top-tier companies. <b>Two pointers, sliding window, and hashing</b> cover most of these. If you nail this category, you handle ~30% of coding rounds. Focus on writing the patterns cleanly and fast.",
    "problems": [
      {
        "n": "01",
        "title": "Two Sum",
        "diff": "easy",
        "lc": "1",
        "pat": "HashMap",
        "statement": "Given an array of integers <b>nums</b> and an integer <b>target</b>, return the indices of the two numbers that add up to target. Exactly one solution exists; you may not use the same element twice.",
        "example": "nums = [2,7,11,15], target = 9\n→ [0,1]   (nums[0]+nums[1] = 2+7 = 9)",
        "approach": "<b>One-pass hash map.</b> For each number, the partner you need is <code>target - num</code>. Store each number's index in a map as you go. Before storing, check if the needed complement is <em>already</em> in the map — if so, you found the pair. This is O(n) instead of the O(n²) brute force of checking all pairs.",
        "code": "public int[] twoSum(int[] nums, int target) {\n    Map<Integer,Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int need = target - nums[i];\n        if (seen.containsKey(need))\n            return new int[]{seen.get(need), i};\n        seen.put(nums[i], i);\n    }\n    return new int[]{};\n}",
        "tc": "O(n)",
        "sc": "O(n)",
        "followup": "<span class='q'>What if the array is sorted?</span> Drop the hash map — use <b>two pointers</b> from both ends, moving inward based on whether the sum is too big or small. O(1) space. <span class='q'>What if you need all pairs, not just one?</span> Keep scanning after a hit and store results; watch for duplicate pairs (sort + skip equal values). <span class='q'>What if the array is too large to fit in memory?</span> External sort, then two-pointer streaming from both ends of the sorted file."
      },
      {
        "n": "02",
        "title": "Best Time to Buy & Sell Stock",
        "diff": "easy",
        "lc": "121",
        "pat": "Greedy / Min-tracking",
        "statement": "Given an array <b>prices</b> where prices[i] is the price of a stock on day i, maximize profit by choosing one day to buy and a later day to sell. Return the max profit, or 0 if none possible.",
        "example": "prices = [7,1,5,3,6,4]\n→ 5   (buy at 1 on day 2, sell at 6 on day 5)",
        "approach": "<b>Track the minimum price seen so far.</b> Walk through prices once. At each day, the best profit if selling today is <code>price - minSoFar</code>. Keep the running minimum buy-price and the running best profit. One pass, no nested loop — the key realization is you never need to look back, just remember the cheapest day so far.",
        "code": "public int maxProfit(int[] prices) {\n    int minPrice = Integer.MAX_VALUE, best = 0;\n    for (int p : prices) {\n        minPrice = Math.min(minPrice, p);   // cheapest buy day so far\n        best = Math.max(best, p - minPrice); // best sell today\n    }\n    return best;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>What if you can make unlimited transactions?</span> (LC 122) Greedily sum every positive day-to-day delta — capture every upward slope. <span class='q'>At most k transactions?</span> (LC 188) DP over <code>dp[k][day]</code> tracking hold/cash states. <span class='q'>With a cooldown or transaction fee?</span> (LC 309/714) Add a state-machine dimension (held / sold / rest)."
      },
      {
        "n": "03",
        "title": "Maximum Subarray (Kadane)",
        "diff": "med",
        "lc": "53",
        "pat": "DP / Kadane",
        "statement": "Given an integer array <b>nums</b>, find the contiguous subarray with the largest sum and return that sum.",
        "example": "nums = [-2,1,-3,4,-1,2,1,-5,4]\n→ 6   (subarray [4,-1,2,1])",
        "approach": "<b>Kadane's algorithm.</b> At each element decide: extend the previous subarray, or start fresh here? You start fresh whenever the running sum has gone negative — a negative prefix only drags down whatever comes next. Keep <code>cur = max(num, cur + num)</code> and track the global best. This is DP collapsed to O(1) space.",
        "code": "public int maxSubArray(int[] nums) {\n    int cur = nums[0], best = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]); // extend or restart\n        best = Math.max(best, cur);\n    }\n    return best;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Return the actual subarray, not just the sum.</span> Track start/end indices: reset <code>start</code> when you restart the running sum, and record <code>[start,end]</code> whenever you beat the best. <span class='q'>What if it's a circular array?</span> (LC 918) Answer is max of (normal Kadane) and (total − minSubarray). <span class='q'>2D version (max sum rectangle)?</span> Fix a pair of columns, compress rows, run Kadane — O(cols²·rows)."
      },
      {
        "n": "04",
        "title": "Product of Array Except Self",
        "diff": "med",
        "lc": "238",
        "pat": "Prefix/Suffix",
        "statement": "Given an array <b>nums</b>, return an array where output[i] is the product of all elements except nums[i]. <b>You must not use division</b>, and it should run in O(n).",
        "example": "nums = [1,2,3,4]\n→ [24,12,8,6]",
        "approach": "<b>Prefix products times suffix products.</b> output[i] = (product of everything left of i) × (product of everything right of i). First pass: fill output with prefix products going left-to-right. Second pass: multiply each by the running suffix product going right-to-left. No division, O(1) extra space (output array doesn't count).",
        "code": "public int[] productExceptSelf(int[] nums) {\n    int n = nums.length;\n    int[] out = new int[n];\n    out[0] = 1;\n    for (int i = 1; i < n; i++)\n        out[i] = out[i-1] * nums[i-1];   // prefix products\n\n    int suffix = 1;\n    for (int i = n-1; i >= 0; i--) {\n        out[i] *= suffix;                // times suffix product\n        suffix *= nums[i];\n    }\n    return out;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>What if division were allowed?</span> Multiply everything, divide out each element — but this breaks when any element is 0 (and needs special-casing one zero vs. multiple). The no-division prefix/suffix method sidesteps that entirely. <span class='q'>Handle zeros without division?</span> The given solution already does — a single zero makes all-but-that-index zero, two zeros make everything zero, automatically."
      },
      {
        "n": "05",
        "title": "Longest Substring Without Repeating Characters",
        "diff": "med",
        "lc": "3",
        "pat": "Sliding Window",
        "statement": "Given a string <b>s</b>, find the length of the longest substring without repeating characters.",
        "example": "s = \"abcabcbb\"\n→ 3   (\"abc\")",
        "approach": "<b>Sliding window with a last-seen map.</b> Expand the right edge. When you hit a character you've seen <em>inside the current window</em>, jump the left edge to just past its previous position. Track the max window length. Using a map of char→lastIndex lets you jump the left pointer directly instead of shrinking one step at a time.",
        "code": "public int lengthOfLongestSubstring(String s) {\n    Map<Character,Integer> last = new HashMap<>();\n    int left = 0, best = 0;\n    for (int right = 0; right < s.length(); right++) {\n        char c = s.charAt(right);\n        if (last.containsKey(c) && last.get(c) >= left)\n            left = last.get(c) + 1;     // jump past the duplicate\n        last.put(c, right);\n        best = Math.max(best, right - left + 1);\n    }\n    return best;\n}",
        "tc": "O(n)",
        "sc": "O(min(n,charset))",
        "followup": "<span class='q'>What if the charset is huge / Unicode?</span> Swap the fixed array for a HashMap of char→index — still O(n). <span class='q'>Return the substring itself?</span> Track the best window's start index alongside its length. <span class='q'>At most K distinct characters?</span> (LC 340) Generalize to a window holding ≤K distinct, shrinking when the map size exceeds K."
      },
      {
        "n": "06",
        "title": "Minimum Window Substring",
        "diff": "hard",
        "lc": "76",
        "pat": "Sliding Window",
        "statement": "Given strings <b>s</b> and <b>t</b>, return the smallest substring of s that contains all characters of t (including duplicates). Return \"\" if none exists.",
        "example": "s = \"ADOBECODEBANC\", t = \"ABC\"\n→ \"BANC\"",
        "approach": "<b>Variable sliding window with a need-count.</b> Count chars needed from t. Expand right, decrementing counts; when a count was >0 and becomes satisfied, increment <code>formed</code>. Once <code>formed == required</code>, contract from left as far as possible while still valid, updating the best window. The <code>have/need</code> bookkeeping is the crux — only count a char as \"formed\" when it exactly meets the requirement.",
        "code": "public String minWindow(String s, String t) {\n    if (s.length() < t.length()) return \"\";\n    int[] need = new int[128];\n    for (char c : t.toCharArray()) need[c]++;\n    int required = t.length(), left = 0;\n    int bestLen = Integer.MAX_VALUE, bestStart = 0;\n\n    for (int right = 0; right < s.length(); right++) {\n        if (need[s.charAt(right)]-- > 0) required--; // consumed a needed char\n        while (required == 0) {                  // valid window\n            if (right - left + 1 < bestLen) {\n                bestLen = right - left + 1;\n                bestStart = left;\n            }\n            if (need[s.charAt(left)]++ == 0) required++; // about to break validity\n            left++;\n        }\n    }\n    return bestLen == Integer.MAX_VALUE ? \"\"\n           : s.substring(bestStart, bestStart + bestLen);\n}",
        "tc": "O(s + t)",
        "sc": "O(1)",
        "followup": "<span class='q'>What if t has Unicode characters?</span> Replace the 128-int array with a HashMap. <span class='q'>What if you want the longest valid window, or all minimal windows?</span> Adjust what you record when valid; for 'all', collect every window tying the best length. <span class='q'>Streaming s?</span> The sliding window already processes s left-to-right in one pass — works on a stream as long as you can't rewind left past the window start."
      },
      {
        "n": "07",
        "title": "Trapping Rain Water",
        "diff": "hard",
        "lc": "42",
        "pat": "Two Pointers",
        "statement": "Given <b>height</b> bars of width 1, compute how much water can be trapped after raining.",
        "example": "height = [0,1,0,2,1,0,1,3,2,1,2,1]\n→ 6",
        "approach": "<b>Two pointers from both ends.</b> Water above any bar is bounded by the shorter of the tallest wall to its left and right. Move the pointer on the side with the <em>smaller</em> max wall — that side's water is fully determined by that wall. Add <code>leftMax - height[i]</code> (or right) as you go. O(n) time, O(1) space — far better than the prefix-array approach.",
        "code": "public int trap(int[] height) {\n    int l = 0, r = height.length - 1;\n    int leftMax = 0, rightMax = 0, water = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            leftMax = Math.max(leftMax, height[l]);\n            water += leftMax - height[l];   // bounded by left wall\n            l++;\n        } else {\n            rightMax = Math.max(rightMax, height[r]);\n            water += rightMax - height[r];  // bounded by right wall\n            r--;\n        }\n    }\n    return water;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>2D version — trapping rain water on a heightmap?</span> (LC 407) Use a min-heap of the boundary cells, always processing the lowest wall inward (like Dijkstra). <span class='q'>Compute via stack instead?</span> A monotonic decreasing stack fills water layer by layer horizontally — good to know as an alternative framing."
      },
      {
        "n": "08",
        "title": "Container With Most Water",
        "diff": "med",
        "lc": "11",
        "pat": "Two Pointers",
        "statement": "Given heights <b>height</b>, pick two lines that with the x-axis form a container holding the most water. Return the max area.",
        "example": "height = [1,8,6,2,5,4,8,3,7]\n→ 49",
        "approach": "<b>Two pointers, move the shorter wall.</b> Area = width × min(left, right). Start wide (both ends). The width only shrinks as pointers close in, so to possibly gain area you must increase the limiting height — always move the <em>shorter</em> wall inward. Moving the taller one can never help. Greedy and provably correct.",
        "code": "public int maxArea(int[] height) {\n    int l = 0, r = height.length - 1, best = 0;\n    while (l < r) {\n        int area = (r - l) * Math.min(height[l], height[r]);\n        best = Math.max(best, area);\n        if (height[l] < height[r]) l++; else r--; // move shorter\n    }\n    return best;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Why is moving the shorter wall always safe?</span> Be ready to prove it: moving the taller wall can't increase the min height but always loses width, so it can never beat the current area. <span class='q'>Three lines forming a container?</span> Opens into a different geometry problem — reviewers sometimes probe whether the two-pointer greed still applies (it doesn't directly)."
      },
      {
        "n": "09",
        "title": "Merge Intervals",
        "diff": "med",
        "lc": "56",
        "pat": "Sorting",
        "statement": "Given an array of <b>intervals</b> [start, end], merge all overlapping intervals and return the non-overlapping result.",
        "example": "[[1,3],[2,6],[8,10],[15,18]]\n→ [[1,6],[8,10],[15,18]]",
        "approach": "<b>Sort by start, then sweep.</b> After sorting, overlaps are always adjacent. Walk through: if the current interval's start ≤ the last merged interval's end, they overlap — extend the end. Otherwise, start a new interval. Sorting is the enabling insight; the merge itself is a single linear pass.",
        "code": "public int[][] merge(int[][] intervals) {\n    Arrays.sort(intervals, (a,b) -> Integer.compare(a[0], b[0]));\n    List<int[]> res = new ArrayList<>();\n    int[] cur = intervals[0];\n    res.add(cur);\n    for (int[] next : intervals) {\n        if (next[0] <= cur[1])          // overlap\n            cur[1] = Math.max(cur[1], next[1]);\n        else { cur = next; res.add(cur); } // disjoint → new\n    }\n    return res.toArray(new int[0][]);\n}",
        "tc": "O(n log n)",
        "sc": "O(n)",
        "followup": "<span class='q'>What if intervals stream in one at a time?</span> (Insert Interval, LC 57) Keep them sorted and binary-search the insertion point, merging neighbors. <span class='q'>Huge dataset that won't fit in memory?</span> External sort by start, then a single streaming merge pass. <span class='q'>Count max overlap instead of merging?</span> Sweep-line: +1 at starts, −1 at ends, track running max."
      },
      {
        "n": "10",
        "title": "Search in Rotated Sorted Array",
        "diff": "med",
        "lc": "33",
        "pat": "Binary Search",
        "statement": "A sorted array was rotated at an unknown pivot. Given <b>nums</b> and a <b>target</b>, return its index or -1. Must be O(log n).",
        "example": "nums = [4,5,6,7,0,1,2], target = 0\n→ 4",
        "approach": "<b>Modified binary search.</b> At any mid, one half is always properly sorted. Check which half is sorted (compare nums[lo] with nums[mid]). If the target lies within that sorted half's range, search there; otherwise search the other half. The trick is identifying the sorted half each step, then deciding which side to keep.",
        "code": "public int search(int[] nums, int target) {\n    int lo = 0, hi = nums.length - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[lo] <= nums[mid]) {        // left half sorted\n            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;\n            else lo = mid + 1;\n        } else {                            // right half sorted\n            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;\n            else hi = mid - 1;\n        }\n    }\n    return -1;\n}",
        "tc": "O(log n)",
        "sc": "O(1)",
        "followup": "<span class='q'>What if duplicates are allowed?</span> (LC 81) Worst case degrades to O(n): when <code>nums[lo]==nums[mid]==nums[hi]</code> you can't tell which half is sorted, so shrink both ends by one. <span class='q'>Find the rotation/pivot point itself?</span> Binary search for the one index where <code>nums[i] > nums[i+1]</code>."
      },
      {
        "n": "11",
        "title": "Longest Consecutive Sequence",
        "diff": "med",
        "lc": "128",
        "pat": "HashSet",
        "statement": "Given an unsorted array <b>nums</b>, return the length of the longest run of consecutive integers. Must run in O(n).",
        "example": "nums = [100,4,200,1,3,2]\n→ 4   (the sequence 1,2,3,4)",
        "approach": "<b>HashSet + only start counting at sequence beginnings.</b> Put everything in a set. For each number, only begin a count if <code>num-1</code> is NOT in the set (meaning num is the start of a run). Then walk upward counting <code>num+1, num+2...</code> The \"only start at a beginning\" check ensures each element is visited at most twice → O(n) total despite the inner loop.",
        "code": "public int longestConsecutive(int[] nums) {\n    Set<Integer> set = new HashSet<>();\n    for (int n : nums) set.add(n);\n    int best = 0;\n    for (int n : set) {\n        if (!set.contains(n - 1)) {     // n starts a sequence\n            int cur = n, len = 1;\n            while (set.contains(cur + 1)) { cur++; len++; }\n            best = Math.max(best, len);\n        }\n    }\n    return best;\n}",
        "tc": "O(n)",
        "sc": "O(n)",
        "followup": "<span class='q'>Why not just sort?</span> Sorting is O(n log n); the HashSet trick is O(n) — reviewers want you to beat the sort. <span class='q'>Return the actual sequence?</span> Track the start value and length of the best run. <span class='q'>Streaming / union-find variant?</span> As numbers arrive, union adjacent values and track the largest component size."
      },
      {
        "n": "12",
        "title": "Valid Anagram / Group Anagrams",
        "diff": "med",
        "lc": "242 / 49",
        "pat": "Hashing",
        "statement": "<b>Valid Anagram:</b> are two strings anagrams? <b>Group Anagrams:</b> group a list of strings so anagrams are together.",
        "example": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]\n→ [[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"],[\"bat\"]]",
        "approach": "<b>Canonical key by sorted chars (or char-count signature).</b> Two strings are anagrams iff their sorted form is identical. For grouping, use the sorted string as a HashMap key and bucket words under it. A faster key for lowercase: a length-26 count array turned into a string — avoids the O(k log k) sort per word.",
        "code": "public List<List<String>> groupAnagrams(String[] strs) {\n    Map<String,List<String>> map = new HashMap<>();\n    for (String s : strs) {\n        char[] cnt = new char[26];\n        for (char c : s.toCharArray()) cnt[c - 'a']++;\n        String key = new String(cnt);     // count signature\n        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n    }\n    return new ArrayList<>(map.values());\n}\n\n// Valid Anagram: compare 26-length counts, or sorted strings\npublic boolean isAnagram(String s, String t) {\n    if (s.length() != t.length()) return false;\n    int[] c = new int[26];\n    for (int i = 0; i < s.length(); i++) {\n        c[s.charAt(i)-'a']++; c[t.charAt(i)-'a']--;\n    }\n    for (int x : c) if (x != 0) return false;\n    return true;\n}",
        "tc": "O(n·k)",
        "sc": "O(n·k)",
        "followup": ""
      },
      {
        "n": "13",
        "title": "Next Permutation",
        "diff": "med",
        "lc": "31",
        "pat": "Array Manipulation",
        "statement": "Rearrange <b>nums</b> into the next lexicographically greater permutation in place. If none exists (descending), wrap to the smallest (ascending). O(1) extra space.",
        "example": "[1,2,3] → [1,3,2]\n[3,2,1] → [1,2,3]",
        "approach": "<b>Find the pivot, swap, reverse.</b> Scan from the right for the first index <code>i</code> where nums[i] &lt; nums[i+1] — that's the pivot to increase. Find the rightmost element bigger than the pivot, swap them. Then reverse everything after the pivot (it was descending, reversing makes it the smallest tail). Three crisp steps.",
        "code": "public void nextPermutation(int[] nums) {\n    int n = nums.length, i = n - 2;\n    while (i >= 0 && nums[i] >= nums[i+1]) i--; // find pivot\n    if (i >= 0) {\n        int j = n - 1;\n        while (nums[j] <= nums[i]) j--;          // next bigger\n        swap(nums, i, j);\n    }\n    reverse(nums, i + 1, n - 1);             // reverse tail\n}\nvoid swap(int[] a, int i, int j){ int t=a[i]; a[i]=a[j]; a[j]=t; }\nvoid reverse(int[] a, int i, int j){ while(i<j) swap(a,i++,j--); }",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Generate ALL permutations in order?</span> Repeatedly applying nextPermutation walks every arrangement lexicographically until it wraps. <span class='q'>kth permutation directly?</span> (LC 60) Use the factorial number system — pick each digit by <code>k / (remaining!)</code> instead of stepping k times."
      },
      {
        "n": "14",
        "title": "Rotate Image (90°)",
        "diff": "med",
        "lc": "48",
        "pat": "Matrix",
        "statement": "Rotate an n×n <b>matrix</b> 90° clockwise, in place.",
        "example": "[[1,2,3],     [[7,4,1],\n [4,5,6],  →   [8,5,2],\n [7,8,9]]      [9,6,3]]",
        "approach": "<b>Transpose, then reverse each row.</b> Transposing swaps matrix[i][j] with matrix[j][i] (flip over the main diagonal). Then reversing each row horizontally completes the 90° clockwise rotation. Both steps are in-place. This decomposition is far cleaner than computing rotated coordinates directly.",
        "code": "public void rotate(int[][] m) {\n    int n = m.length;\n    for (int i = 0; i < n; i++)        // transpose\n        for (int j = i + 1; j < n; j++) {\n            int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t;\n        }\n    for (int[] row : m) {              // reverse each row\n        int l = 0, r = n - 1;\n        while (l < r) { int t = row[l]; row[l++] = row[r]; row[r--] = t; }\n    }\n}",
        "tc": "O(n²)",
        "sc": "O(1)",
        "followup": "<span class='q'>Rotate counter-clockwise?</span> Reverse each row first, then transpose (or transpose then reverse columns). <span class='q'>Rotate by 180°?</span> Reverse rows and reverse each row. <span class='q'>Non-square matrix?</span> Can't rotate in place — needs a new m×n→n×m buffer."
      },
      {
        "n": "15",
        "title": "Spiral Matrix",
        "diff": "med",
        "lc": "54",
        "pat": "Matrix",
        "statement": "Given an m×n <b>matrix</b>, return all elements in spiral order (right → down → left → up, inward).",
        "example": "[[1,2,3],[4,5,6],[7,8,9]]\n→ [1,2,3,6,9,8,7,4,5]",
        "approach": "<b>Four shrinking boundaries.</b> Maintain top, bottom, left, right edges. Traverse the top row left-to-right, then right column top-to-bottom, then bottom row right-to-left, then left column bottom-to-top — shrinking the relevant boundary after each pass. Guard against re-traversing when the matrix isn't square with the inner <code>if</code> checks.",
        "code": "public List<Integer> spiralOrder(int[][] m) {\n    List<Integer> res = new ArrayList<>();\n    int top = 0, bottom = m.length-1, left = 0, right = m[0].length-1;\n    while (top <= bottom && left <= right) {\n        for (int c = left; c <= right; c++) res.add(m[top][c]);\n        top++;\n        for (int r = top; r <= bottom; r++) res.add(m[r][right]);\n        right--;\n        if (top <= bottom) {\n            for (int c = right; c >= left; c--) res.add(m[bottom][c]);\n            bottom--;\n        }\n        if (left <= right) {\n            for (int r = bottom; r >= top; r--) res.add(m[r][left]);\n            left++;\n        }\n    }\n    return res;\n}",
        "tc": "O(m·n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Generate a spiral matrix from 1..n² (LC 59)?</span> Same four-boundary walk, but writing values instead of reading. <span class='q'>What about spiral from the center outward?</span> Reverse the boundary logic or simulate direction changes with a visited grid."
      }
    ]
  },
  {
    "id": "linkedlist",
    "name": "Linked Lists",
    "meta": "pointers · dummy nodes · O(1) space",
    "intro": "Linked list problems test <b>pointer manipulation precision</b>. The recurring tools: a <b>dummy head</b> to avoid edge cases, <b>fast/slow pointers</b> for cycles and midpoints, and careful <b>reversal</b>. Draw the nodes on paper — these are bug-prone if you code blind.",
    "problems": [
      {
        "n": "01",
        "title": "Reverse Linked List",
        "diff": "easy",
        "lc": "206",
        "pat": "Pointer Reversal",
        "statement": "Reverse a singly linked list and return the new head.",
        "example": "1→2→3→4→5  →  5→4→3→2→1",
        "approach": "<b>Three pointers: prev, cur, next.</b> Walk the list, and at each node redirect its <code>next</code> pointer to <code>prev</code>. Save <code>next</code> before you overwrite it or you lose the rest of the list. When <code>cur</code> reaches null, <code>prev</code> is the new head. The recursive version is elegant but uses O(n) stack — mention both.",
        "code": "public ListNode reverseList(ListNode head) {\n    ListNode prev = null, cur = head;\n    while (cur != null) {\n        ListNode next = cur.next;  // save before overwrite\n        cur.next = prev;            // reverse the link\n        prev = cur;                 // advance prev\n        cur = next;                 // advance cur\n    }\n    return prev;                    // new head\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Reverse only between positions m and n?</span> (LC 92) Reverse the sublist in one pass with careful boundary reconnection. <span class='q'>Reverse in groups of k?</span> (LC 25) See the k-Group problem in this list. <span class='q'>Recursive vs iterative tradeoff?</span> Recursive is elegant but O(n) stack — mention the risk on very long lists."
      },
      {
        "n": "02",
        "title": "Merge Two Sorted Lists",
        "diff": "easy",
        "lc": "21",
        "pat": "Dummy Node",
        "statement": "Merge two sorted linked lists into one sorted list and return its head.",
        "example": "1→2→4 , 1→3→4  →  1→1→2→3→4→4",
        "approach": "<b>Dummy head + tail pointer.</b> Create a dummy node to anchor the result so you never special-case the first insertion. Compare the heads of both lists, attach the smaller to the tail, advance that list. When one list runs out, attach the remainder of the other. Return <code>dummy.next</code>.",
        "code": "public ListNode mergeTwoLists(ListNode a, ListNode b) {\n    ListNode dummy = new ListNode(0), tail = dummy;\n    while (a != null && b != null) {\n        if (a.val <= b.val) { tail.next = a; a = a.next; }\n        else               { tail.next = b; b = b.next; }\n        tail = tail.next;\n    }\n    tail.next = (a != null) ? a : b;   // attach remainder\n    return dummy.next;\n}",
        "tc": "O(n+m)",
        "sc": "O(1)",
        "followup": ""
      },
      {
        "n": "03",
        "title": "Merge K Sorted Lists",
        "diff": "hard",
        "lc": "23",
        "pat": "Heap / Divide&Conquer",
        "statement": "Merge <b>k</b> sorted linked lists into one sorted list.",
        "example": "[1→4→5, 1→3→4, 2→6]  →  1→1→2→3→4→4→5→6",
        "approach": "<b>Min-heap of the k current heads.</b> Push the head of every list into a priority queue ordered by value. Poll the smallest, append it to the result, then push that node's <code>next</code>. Repeat until the heap empties. O(N log k) where N is total nodes. Alternative: divide-and-conquer pairwise merging, same complexity.",
        "code": "public ListNode mergeKLists(ListNode[] lists) {\n    PriorityQueue<ListNode> pq =\n        new PriorityQueue<>((x, y) -> x.val - y.val);\n    for (ListNode node : lists)\n        if (node != null) pq.offer(node);\n\n    ListNode dummy = new ListNode(0), tail = dummy;\n    while (!pq.isEmpty()) {\n        ListNode node = pq.poll();\n        tail.next = node; tail = node;\n        if (node.next != null) pq.offer(node.next);\n    }\n    return dummy.next;\n}",
        "tc": "O(N log k)",
        "sc": "O(k)",
        "followup": "<span class='q'>Heap vs divide-and-conquer — which is better?</span> Both are O(N log k); D&C pairwise merging avoids heap overhead and can be easier to reason about. <span class='q'>What if the lists are enormous / on disk?</span> This is literally external merge sort's merge phase — the k-way heap merge streams without loading everything."
      },
      {
        "n": "04",
        "title": "Remove Nth Node From End",
        "diff": "med",
        "lc": "19",
        "pat": "Two Pointers",
        "statement": "Remove the <b>nth</b> node from the end of the list and return the head.",
        "example": "1→2→3→4→5, n=2  →  1→2→3→5",
        "approach": "<b>Gap of n between two pointers.</b> Advance a <code>fast</code> pointer n steps ahead. Then move <code>fast</code> and <code>slow</code> together until fast hits the end — now slow sits just before the target. Use a dummy head so removing the first node is handled uniformly. One pass, no length pre-count.",
        "code": "public ListNode removeNthFromEnd(ListNode head, int n) {\n    ListNode dummy = new ListNode(0);\n    dummy.next = head;\n    ListNode fast = dummy, slow = dummy;\n    for (int i = 0; i < n; i++) fast = fast.next; // gap of n\n    while (fast.next != null) {              // move together\n        fast = fast.next; slow = slow.next;\n    }\n    slow.next = slow.next.next;                  // skip target\n    return dummy.next;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Why the dummy node?</span> Be ready to explain: it handles removing the head uniformly so you don't special-case <code>n == length</code>. <span class='q'>Single pass guaranteed?</span> Yes — the two-pointer gap avoids a separate length-counting pass; reviewers often ask you to eliminate that first pass."
      },
      {
        "n": "05",
        "title": "Linked List Cycle + Cycle Start",
        "diff": "med",
        "lc": "141 / 142",
        "pat": "Floyd Fast/Slow",
        "statement": "<b>Detect</b> if the list has a cycle. If so, return the node where the cycle begins.",
        "example": "3→2→0→-4→(back to 2)  →  cycle starts at node 2",
        "approach": "<b>Floyd's Tortoise and Hare.</b> Slow moves 1, fast moves 2. If they meet, there's a cycle. To find the <em>start</em>: reset one pointer to head, then advance both one step at a time — they meet exactly at the cycle entrance. The math: the distance from head to entry equals the distance from meeting point to entry.",
        "code": "public ListNode detectCycle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) {            // cycle found\n            ListNode p = head;\n            while (p != slow) { p = p.next; slow = slow.next; }\n            return p;                  // cycle entry\n        }\n    }\n    return null;                      // no cycle\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Prove why resetting to head finds the entry.</span> Let the head-to-entry distance be a and entry-to-meeting be b; the math shows a equals the remaining loop distance from the meeting point. Be ready to derive it. <span class='q'>Find cycle length?</span> Once slow and fast meet, keep one fixed and advance the other until they meet again, counting steps."
      },
      {
        "n": "06",
        "title": "Reorder List",
        "diff": "med",
        "lc": "143",
        "pat": "Mid + Reverse + Merge",
        "statement": "Reorder L0→L1→…→Ln into L0→Ln→L1→Ln-1→… in place.",
        "example": "1→2→3→4  →  1→4→2→3",
        "approach": "<b>Three classic sub-routines combined.</b> (1) Find the middle with fast/slow. (2) Reverse the second half. (3) Merge the two halves alternately. Each piece is a known pattern; the skill is composing them cleanly. This problem is a great test of whether you've internalized the building blocks.",
        "code": "public void reorderList(ListNode head) {\n    if (head == null || head.next == null) return;\n    // 1. find middle\n    ListNode slow = head, fast = head;\n    while (fast.next != null && fast.next.next != null) {\n        slow = slow.next; fast = fast.next.next;\n    }\n    // 2. reverse second half\n    ListNode second = slow.next, prev = null;\n    slow.next = null;\n    while (second != null) {\n        ListNode nx = second.next;\n        second.next = prev; prev = second; second = nx;\n    }\n    // 3. merge two halves\n    ListNode first = head;\n    while (prev != null) {\n        ListNode n1 = first.next, n2 = prev.next;\n        first.next = prev; prev.next = n1;\n        first = n1; prev = n2;\n    }\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": ""
      },
      {
        "n": "07",
        "title": "Copy List with Random Pointer",
        "diff": "med",
        "lc": "138",
        "pat": "Interleaving / HashMap",
        "statement": "Deep-copy a list where each node has a <b>next</b> and a <b>random</b> pointer (which can point anywhere or null).",
        "example": "clone all nodes + replicate random pointers exactly",
        "approach": "<b>Interleave cloned nodes, then split — O(1) extra space.</b> Insert each copy right after its original (A→A'→B→B'…). Now <code>copy.random = original.random.next</code> sets every random in one pass. Finally unweave the two lists. The HashMap approach (map original→copy) is simpler to reason about but uses O(n) space — know both.",
        "code": "public Node copyRandomList(Node head) {\n    if (head == null) return null;\n    // 1. clone interleaved: A -> A' -> B -> B'\n    for (Node cur = head; cur != null; cur = cur.next.next) {\n        Node copy = new Node(cur.val);\n        copy.next = cur.next; cur.next = copy;\n    }\n    // 2. assign randoms\n    for (Node cur = head; cur != null; cur = cur.next.next)\n        if (cur.random != null)\n            cur.next.random = cur.random.next;\n    // 3. split the two lists\n    Node dummy = new Node(0), copyTail = dummy;\n    for (Node cur = head; cur != null; cur = cur.next) {\n        copyTail.next = cur.next;\n        copyTail = copyTail.next;\n        cur.next = cur.next.next;       // restore original\n    }\n    return dummy.next;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": ""
      },
      {
        "n": "08",
        "title": "LRU Cache",
        "diff": "med",
        "lc": "146",
        "pat": "HashMap + DLL",
        "statement": "Design an LRU cache with O(1) <b>get</b> and <b>put</b>. Evict the least recently used item when capacity is exceeded.",
        "example": "cap=2: put(1,1),put(2,2),get(1)=1,put(3,3) evicts 2",
        "approach": "<b>HashMap for lookup + doubly linked list for order.</b> Map gives O(1) key→node access. The DLL keeps usage order: most-recent at head, least-recent at tail. On access, move the node to head. On overflow, evict the tail. Sentinel head/tail nodes remove all null-checking edge cases.",
        "code": "class LRUCache {\n    class Node { int k, v; Node prev, next;\n        Node(int k, int v){ this.k=k; this.v=v; } }\n\n    private Map<Integer,Node> map = new HashMap<>();\n    private Node head = new Node(0,0), tail = new Node(0,0);\n    private int cap;\n\n    public LRUCache(int capacity) {\n        cap = capacity;\n        head.next = tail; tail.prev = head;\n    }\n    private void remove(Node n){ n.prev.next = n.next; n.next.prev = n.prev; }\n    private void insertFront(Node n){\n        n.next = head.next; n.prev = head;\n        head.next.prev = n; head.next = n;\n    }\n    public int get(int key) {\n        if (!map.containsKey(key)) return -1;\n        Node n = map.get(key);\n        remove(n); insertFront(n);\n        return n.v;\n    }\n    public void put(int key, int value) {\n        if (map.containsKey(key)) remove(map.get(key));\n        Node n = new Node(key, value);\n        map.put(key, n); insertFront(n);\n        if (map.size() > cap) {\n            Node lru = tail.prev;\n            remove(lru); map.remove(lru.k);\n        }\n    }\n}",
        "tc": "O(1)",
        "sc": "O(cap)",
        "followup": "<span class='q'>Make it thread-safe?</span> Guard operations with a lock, or use a concurrent structure; discuss contention on the hot head/tail nodes. <span class='q'>LFU instead of LRU?</span> (LC 460) Add frequency buckets — each frequency maps to its own DLL. <span class='q'>Could you use Java's LinkedHashMap?</span> Yes — override <code>removeEldestEntry</code>; good to mention but reviewers usually want the manual DLL+map."
      },
      {
        "n": "09",
        "title": "Reverse Nodes in k-Group",
        "diff": "hard",
        "lc": "25",
        "pat": "Group Reversal",
        "statement": "Reverse the nodes of the list <b>k</b> at a time. Nodes left over (fewer than k) stay as-is.",
        "example": "1→2→3→4→5, k=2  →  2→1→4→3→5",
        "approach": "<b>Check k nodes exist, reverse the group, recurse/iterate.</b> First verify there are k nodes ahead; if not, leave the rest untouched. Reverse exactly k nodes, then connect the reversed group's tail to the result of processing the remainder. A dummy head and careful boundary pointers keep the links correct across groups.",
        "code": "public ListNode reverseKGroup(ListNode head, int k) {\n    ListNode node = head;\n    for (int i = 0; i < k; i++) {        // enough nodes?\n        if (node == null) return head;       // fewer than k → keep\n        node = node.next;\n    }\n    // reverse first k nodes\n    ListNode prev = reverseKGroup(node, k);  // rest first\n    ListNode cur = head;\n    for (int i = 0; i < k; i++) {\n        ListNode nx = cur.next;\n        cur.next = prev; prev = cur; cur = nx;\n    }\n    return prev;                          // new head of this group\n}",
        "tc": "O(n)",
        "sc": "O(n/k) stack",
        "followup": "<span class='q'>Iterative instead of recursive (O(1) space)?</span> Track a group-prev pointer and re-link each reversed block — reviewers often require this since recursion uses O(n/k) stack. <span class='q'>Left-over nodes fewer than k — reverse them anyway?</span> Just drop the length-check guard."
      },
      {
        "n": "10",
        "title": "Palindrome Linked List",
        "diff": "easy",
        "lc": "234",
        "pat": "Mid + Reverse",
        "statement": "Determine whether a singly linked list is a palindrome. Aim for O(n) time, O(1) space.",
        "example": "1→2→2→1  →  true",
        "approach": "<b>Find middle, reverse second half, compare.</b> Use fast/slow to reach the midpoint, reverse the second half in place, then walk both halves inward comparing values. Optionally restore the list afterward. This achieves O(1) space versus the naive approach of dumping values into an array.",
        "code": "public boolean isPalindrome(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next; fast = fast.next.next;\n    }\n    // reverse second half\n    ListNode prev = null;\n    while (slow != null) {\n        ListNode nx = slow.next;\n        slow.next = prev; prev = slow; slow = nx;\n    }\n    // compare halves\n    ListNode left = head, right = prev;\n    while (right != null) {\n        if (left.val != right.val) return false;\n        left = left.next; right = right.next;\n    }\n    return true;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": ""
      }
    ]
  },
  {
    "id": "trees",
    "name": "Trees & BST",
    "meta": "highest frequency · DFS/BFS recursion",
    "intro": "Trees are <b>the most-tested category at top-tier companies</b>. Almost everything is <b>recursion</b>: define what the function returns for a subtree, trust it for children, combine. Master DFS (pre/in/post), BFS level-order, and the BST property (in-order = sorted). The \"return value from recursion\" mindset unlocks the hard ones.",
    "problems": [
      {
        "n": "01",
        "title": "Binary Tree Level Order Traversal",
        "diff": "med",
        "lc": "102",
        "pat": "BFS",
        "statement": "Return the node values level by level, top to bottom, left to right.",
        "example": "    3\n   / \\\n  9  20      →  [[3],[9,20],[15,7]]\n    /  \\\n   15   7",
        "approach": "<b>BFS with level-size snapshot.</b> Use a queue. At the start of each level, record <code>queue.size()</code> — that's exactly how many nodes are on the current level. Process precisely that many, collecting their values and enqueuing children. This cleanly separates levels without extra markers.",
        "code": "public List<List<Integer>> levelOrder(TreeNode root) {\n    List<List<Integer>> res = new ArrayList<>();\n    if (root == null) return res;\n    Queue<TreeNode> q = new LinkedList<>();\n    q.offer(root);\n    while (!q.isEmpty()) {\n        int size = q.size();        // nodes on this level\n        List<Integer> level = new ArrayList<>();\n        for (int i = 0; i < size; i++) {\n            TreeNode node = q.poll();\n            level.add(node.val);\n            if (node.left != null) q.offer(node.left);\n            if (node.right != null) q.offer(node.right);\n        }\n        res.add(level);\n    }\n    return res;\n}",
        "tc": "O(n)",
        "sc": "O(n)",
        "followup": "<span class='q'>Zigzag order?</span> (LC 103) Reverse alternate levels (or use a deque). <span class='q'>Bottom-up levels?</span> (LC 107) Build normally, reverse the result. <span class='q'>Right-side view?</span> Take the last node of each level (see that problem). <span class='q'>Average/largest per level?</span> Aggregate within the level loop instead of collecting all values."
      },
      {
        "n": "02",
        "title": "Maximum Depth of Binary Tree",
        "diff": "easy",
        "lc": "104",
        "pat": "DFS Recursion",
        "statement": "Return the maximum depth (longest root-to-leaf path length) of a binary tree.",
        "example": "[3,9,20,null,null,15,7]  →  3",
        "approach": "<b>Depth = 1 + max(left depth, right depth).</b> The textbook recursion. A null node has depth 0. Each node's depth is one more than its deeper subtree. This \"define the answer for a subtree, recurse, combine\" pattern is the template for nearly every tree problem.",
        "code": "public int maxDepth(TreeNode root) {\n    if (root == null) return 0;\n    return 1 + Math.max(maxDepth(root.left),\n                        maxDepth(root.right));\n}",
        "tc": "O(n)",
        "sc": "O(h)",
        "followup": ""
      },
      {
        "n": "03",
        "title": "Validate Binary Search Tree",
        "diff": "med",
        "lc": "98",
        "pat": "DFS + Bounds",
        "statement": "Determine if a binary tree is a valid BST: left subtree < node < right subtree, recursively.",
        "example": "[2,1,3] → true   [5,1,4,null,null,3,6] → false",
        "approach": "<b>Pass down valid (min, max) bounds.</b> A common mistake is only comparing a node to its direct children — that misses deep violations. Instead, every node must lie strictly within an inherited range. Going left tightens the upper bound to the node's value; going right tightens the lower bound. Use <code>long</code> bounds to handle Integer.MIN/MAX edge values.",
        "code": "public boolean isValidBST(TreeNode root) {\n    return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);\n}\nprivate boolean valid(TreeNode node, long lo, long hi) {\n    if (node == null) return true;\n    if (node.val <= lo || node.val >= hi) return false;\n    return valid(node.left, lo, node.val)      // tighten upper\n        && valid(node.right, node.val, hi);    // tighten lower\n}",
        "tc": "O(n)",
        "sc": "O(h)",
        "followup": "<span class='q'>Why not just compare each node to its children?</span> Be ready to give the counter-example where a deep descendant violates an ancestor's bound — the (min,max) range is essential. <span class='q'>Alternative approach?</span> In-order traversal must produce strictly increasing values; track the previous value. <span class='q'>Recover a BST with two swapped nodes?</span> (LC 99) In-order, find the two out-of-order points."
      },
      {
        "n": "04",
        "title": "Lowest Common Ancestor (BST & Binary Tree)",
        "diff": "med",
        "lc": "235 / 236",
        "pat": "DFS",
        "statement": "Find the lowest common ancestor of two nodes <b>p</b> and <b>q</b>. Two versions: a BST (exploit ordering) and a general binary tree.",
        "example": "tree [3,5,1,6,2,0,8], p=5,q=1  →  3",
        "approach": "<b>BST: use ordering to walk down.</b> If both p and q are smaller, go left; if both larger, go right; otherwise this node is the split point = LCA. <b>General tree: recurse and bubble up.</b> If a subtree contains p or q, it returns that node; the first node receiving non-null from <em>both</em> sides is the LCA.",
        "code": "// BST version — O(h)\npublic TreeNode lcaBST(TreeNode root, TreeNode p, TreeNode q) {\n    while (root != null) {\n        if (p.val < root.val && q.val < root.val) root = root.left;\n        else if (p.val > root.val && q.val > root.val) root = root.right;\n        else return root;           // split point\n    }\n    return null;\n}\n\n// General binary tree version — O(n)\npublic TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {\n    if (root == null || root == p || root == q) return root;\n    TreeNode left = lca(root.left, p, q);\n    TreeNode right = lca(root.right, p, q);\n    if (left != null && right != null) return root; // found in both\n    return left != null ? left : right;\n}",
        "tc": "O(n)",
        "sc": "O(h)",
        "followup": "<span class='q'>Nodes have parent pointers?</span> Walk up from both to collect ancestors, or use the two-pointer 'linked list intersection' trick. <span class='q'>Many repeated LCA queries on a static tree?</span> Preprocess with binary lifting or Euler tour + sparse table for O(log n) or O(1) per query. <span class='q'>What if a node might not exist in the tree?</span> Add a presence check."
      },
      {
        "n": "05",
        "title": "Serialize and Deserialize Binary Tree",
        "diff": "hard",
        "lc": "297",
        "pat": "DFS Preorder",
        "statement": "Design <b>serialize</b> (tree → string) and <b>deserialize</b> (string → tree) so the round trip reproduces the original tree.",
        "example": "[1,2,3,null,null,4,5]  ⟷  \"1,2,#,#,3,4,#,#,5,#,#\"",
        "approach": "<b>Preorder DFS with null markers.</b> Serialize by writing each node's value, using a sentinel (<code>#</code>) for null — this captures structure unambiguously. Deserialize by consuming tokens in the same preorder: read a value, build the node, recursively build left then right. The null markers are what make reconstruction deterministic.",
        "code": "public String serialize(TreeNode root) {\n    StringBuilder sb = new StringBuilder();\n    build(root, sb);\n    return sb.toString();\n}\nprivate void build(TreeNode node, StringBuilder sb) {\n    if (node == null) { sb.append(\"#,\"); return; }\n    sb.append(node.val).append(\",\");\n    build(node.left, sb);\n    build(node.right, sb);\n}\npublic TreeNode deserialize(String data) {\n    Queue<String> q = new LinkedList<>(Arrays.asList(data.split(\",\")));\n    return rebuild(q);\n}\nprivate TreeNode rebuild(Queue<String> q) {\n    String val = q.poll();\n    if (val.equals(\"#\")) return null;\n    TreeNode node = new TreeNode(Integer.parseInt(val));\n    node.left = rebuild(q);\n    node.right = rebuild(q);\n    return node;\n}",
        "tc": "O(n)",
        "sc": "O(n)",
        "followup": "<span class='q'>Serialize a BST more compactly?</span> (LC 449) You can skip null markers — preorder alone reconstructs a BST using value bounds. <span class='q'>BFS instead of DFS encoding?</span> Level-order with null markers (LeetCode's own format) works too. <span class='q'>N-ary tree?</span> (LC 428) Encode child counts or use a sentinel to close each child list."
      },
      {
        "n": "06",
        "title": "Binary Tree Maximum Path Sum",
        "diff": "hard",
        "lc": "124",
        "pat": "DFS + Global Max",
        "statement": "Find the maximum path sum. A path is any node sequence connected by edges; it need not pass through the root and can start/end anywhere.",
        "example": "[-10,9,20,null,null,15,7]  →  42  (15→20→7)",
        "approach": "<b>Return the best one-sided gain; update a global max with the two-sided sum.</b> For each node, the best \"downward\" contribution it can pass to its parent is <code>node.val + max(leftGain, rightGain, 0)</code> (drop negatives). But the best path <em>through</em> this node is <code>node.val + leftGain + rightGain</code> — that \"split\" can't be passed up but might be the global answer. Track it in a field.",
        "code": "private int maxSum = Integer.MIN_VALUE;\n\npublic int maxPathSum(TreeNode root) {\n    gain(root);\n    return maxSum;\n}\nprivate int gain(TreeNode node) {\n    if (node == null) return 0;\n    int left = Math.max(gain(node.left), 0);   // drop negatives\n    int right = Math.max(gain(node.right), 0);\n    maxSum = Math.max(maxSum, node.val + left + right); // path through node\n    return node.val + Math.max(left, right);    // one side passes up\n}",
        "tc": "O(n)",
        "sc": "O(h)",
        "followup": "<span class='q'>Return the actual path, not just the sum?</span> Track which child gave the max gain at each node and reconstruct. <span class='q'>All-positive values?</span> The 'drop negatives' guard becomes unnecessary. <span class='q'>Path must start or end at the root?</span> Simpler — just the best single downward chain."
      },
      {
        "n": "07",
        "title": "Construct Tree from Preorder & Inorder",
        "diff": "med",
        "lc": "105",
        "pat": "Divide & Conquer",
        "statement": "Given <b>preorder</b> and <b>inorder</b> traversals, reconstruct the binary tree.",
        "example": "preorder=[3,9,20,15,7], inorder=[9,3,15,20,7]",
        "approach": "<b>Preorder's first element is always the root.</b> Find it in the inorder array — everything left of it is the left subtree, everything right is the right subtree. Recurse on those slices. A HashMap of value→inorder-index makes the lookup O(1), giving overall O(n). Use a moving preorder pointer to assign roots in order.",
        "code": "private int preIdx = 0;\nprivate Map<Integer,Integer> inMap = new HashMap<>();\n\npublic TreeNode buildTree(int[] preorder, int[] inorder) {\n    for (int i = 0; i < inorder.length; i++)\n        inMap.put(inorder[i], i);\n    return build(preorder, 0, inorder.length - 1);\n}\nprivate TreeNode build(int[] pre, int lo, int hi) {\n    if (lo > hi) return null;\n    int rootVal = pre[preIdx++];\n    TreeNode root = new TreeNode(rootVal);\n    int mid = inMap.get(rootVal);     // split point\n    root.left = build(pre, lo, mid - 1);\n    root.right = build(pre, mid + 1, hi);\n    return root;\n}",
        "tc": "O(n)",
        "sc": "O(n)",
        "followup": "<span class='q'>From postorder + inorder?</span> (LC 106) Consume postorder from the right, building right subtree before left. <span class='q'>From preorder + postorder?</span> (LC 889) Not unique in general — be ready to explain why (can't place single children unambiguously). <span class='q'>Duplicate values?</span> The inorder-index map breaks; you'd need a different disambiguation."
      },
      {
        "n": "08",
        "title": "Kth Smallest Element in a BST",
        "diff": "med",
        "lc": "230",
        "pat": "In-order Traversal",
        "statement": "Return the <b>k</b>th smallest value in a BST (1-indexed).",
        "example": "[3,1,4,null,2], k=1  →  1",
        "approach": "<b>In-order traversal of a BST yields sorted order.</b> Do an in-order walk and stop at the kth node visited. Iterative with an explicit stack lets you halt early without traversing the whole tree. The BST property is the entire trick — in-order = ascending.",
        "code": "public int kthSmallest(TreeNode root, int k) {\n    Deque<TreeNode> stack = new ArrayDeque<>();\n    TreeNode cur = root;\n    while (cur != null || !stack.isEmpty()) {\n        while (cur != null) {        // go left as far as possible\n            stack.push(cur); cur = cur.left;\n        }\n        cur = stack.pop();             // smallest unvisited\n        if (--k == 0) return cur.val;\n        cur = cur.right;\n    }\n    return -1;\n}",
        "tc": "O(h+k)",
        "sc": "O(h)",
        "followup": "<span class='q'>What if the BST is modified often (inserts/deletes) and you query kth a lot?</span> Augment each node with its subtree size — then kth-smallest is O(h) without full traversal. This augmentation follow-up is a very common senior-level probe. <span class='q'>Kth largest?</span> Reverse in-order (right→node→left)."
      },
      {
        "n": "09",
        "title": "Diameter of Binary Tree",
        "diff": "easy",
        "lc": "543",
        "pat": "DFS + Global Max",
        "statement": "Return the length (in edges) of the longest path between any two nodes. The path may not pass through the root.",
        "example": "[1,2,3,4,5]  →  3  (path 4→2→1→3 or 5→2→1→3)",
        "approach": "<b>Same shape as Max Path Sum.</b> Each node returns its height (longest downward path). The diameter <em>through</em> a node is <code>leftHeight + rightHeight</code>. Track the max of that across all nodes in a field while the recursion computes heights. One DFS, O(n).",
        "code": "private int diameter = 0;\n\npublic int diameterOfBinaryTree(TreeNode root) {\n    height(root);\n    return diameter;\n}\nprivate int height(TreeNode node) {\n    if (node == null) return 0;\n    int left = height(node.left);\n    int right = height(node.right);\n    diameter = Math.max(diameter, left + right); // path through node\n    return 1 + Math.max(left, right);\n}",
        "tc": "O(n)",
        "sc": "O(h)",
        "followup": ""
      },
      {
        "n": "10",
        "title": "Binary Tree Right Side View",
        "diff": "med",
        "lc": "199",
        "pat": "BFS / DFS",
        "statement": "Return the values of nodes visible from the right side, top to bottom.",
        "example": "[1,2,3,null,5,null,4]  →  [1,3,4]",
        "approach": "<b>Level-order BFS, take the last node of each level.</b> The rightmost node on each level is exactly what's visible from the right. Run standard level-order and capture the final node processed per level. (DFS alternative: visit right child first, record the first node seen at each new depth.)",
        "code": "public List<Integer> rightSideView(TreeNode root) {\n    List<Integer> res = new ArrayList<>();\n    if (root == null) return res;\n    Queue<TreeNode> q = new LinkedList<>();\n    q.offer(root);\n    while (!q.isEmpty()) {\n        int size = q.size();\n        for (int i = 0; i < size; i++) {\n            TreeNode node = q.poll();\n            if (i == size - 1) res.add(node.val); // last = rightmost\n            if (node.left != null) q.offer(node.left);\n            if (node.right != null) q.offer(node.right);\n        }\n    }\n    return res;\n}",
        "tc": "O(n)",
        "sc": "O(n)",
        "followup": ""
      }
    ]
  },
  {
    "id": "graphs",
    "name": "Graphs",
    "meta": "BFS · DFS · Union-Find · Dijkstra",
    "intro": "Graph problems test whether you can <b>model a problem as nodes and edges</b>, then pick the right traversal. Grid problems are graphs in disguise. Know: BFS for shortest unweighted paths, DFS for connectivity, <b>topological sort</b> for dependencies, <b>Union-Find</b> for components, and <b>Dijkstra</b> for weighted shortest paths.",
    "problems": [
      {
        "n": "01",
        "title": "Number of Islands",
        "diff": "med",
        "lc": "200",
        "pat": "DFS / BFS Flood Fill",
        "statement": "Given a 2D grid of '1' (land) and '0' (water), count the number of islands. Land connects horizontally/vertically.",
        "example": "[[\"1\",\"1\",\"0\"],[\"1\",\"0\",\"0\"],[\"0\",\"0\",\"1\"]]  →  2",
        "approach": "<b>Flood fill each unvisited land cell.</b> Scan the grid; when you hit a '1', increment the count and DFS/BFS to sink the entire connected island (mark cells visited so you don't recount). Each cell is visited once → O(m·n). Sinking in place (set to '0') avoids a separate visited array.",
        "code": "public int numIslands(char[][] grid) {\n    int count = 0;\n    for (int r = 0; r < grid.length; r++)\n        for (int c = 0; c < grid[0].length; c++)\n            if (grid[r][c] == '1') {\n                count++;\n                sink(grid, r, c);\n            }\n    return count;\n}\nprivate void sink(char[][] g, int r, int c) {\n    if (r < 0 || r >= g.length || c < 0 || c >= g[0].length\n            || g[r][c] == '0') return;\n    g[r][c] = '0';                  // mark visited\n    sink(g, r+1, c); sink(g, r-1, c);\n    sink(g, r, c+1); sink(g, r, c-1);\n}",
        "tc": "O(m·n)",
        "sc": "O(m·n)",
        "followup": "<span class='q'>What if the grid is too large to fit in memory?</span> Process it in chunks/streaming rows and use Union-Find across chunk boundaries to stitch islands. <span class='q'>Count islands as cells are added one by one?</span> (LC 305, Islands II) Union-Find with a running component count. <span class='q'>Recursion stack overflow on huge grids?</span> Switch DFS to an explicit stack or BFS queue."
      },
      {
        "n": "02",
        "title": "Clone Graph",
        "diff": "med",
        "lc": "133",
        "pat": "DFS/BFS + HashMap",
        "statement": "Deep-copy a connected undirected graph. Each node has a value and a list of neighbors.",
        "example": "adjacency [[2,4],[1,3],[2,4],[1,3]]  →  identical clone",
        "approach": "<b>HashMap from original node → its clone.</b> DFS the graph; when you first see a node, create its clone and record it in the map <em>before</em> recursing into neighbors (this prevents infinite loops on cycles). For each neighbor, get-or-create its clone and link it. The map doubles as the visited set.",
        "code": "private Map<Node,Node> clones = new HashMap<>();\n\npublic Node cloneGraph(Node node) {\n    if (node == null) return null;\n    if (clones.containsKey(node)) return clones.get(node);\n\n    Node copy = new Node(node.val);\n    clones.put(node, copy);          // record BEFORE recursing\n    for (Node nei : node.neighbors)\n        copy.neighbors.add(cloneGraph(nei));\n    return copy;\n}",
        "tc": "O(V+E)",
        "sc": "O(V)",
        "followup": "<span class='q'>BFS instead of recursive DFS?</span> Use a queue plus the same visited-map; avoids deep recursion on large graphs. <span class='q'>Disconnected graph?</span> Iterate over all nodes as potential starts. <span class='q'>Graph with edge weights or node metadata?</span> Copy those fields alongside the value during cloning."
      },
      {
        "n": "03",
        "title": "Course Schedule (I & II)",
        "diff": "med",
        "lc": "207 / 210",
        "pat": "Topological Sort",
        "statement": "Given <b>numCourses</b> and prerequisite pairs [a, b] (b before a), determine if all can be finished (I), and return a valid order (II).",
        "example": "numCourses=4, prereqs=[[1,0],[2,0],[3,1],[3,2]]  →  [0,1,2,3]",
        "approach": "<b>Kahn's algorithm (BFS topological sort).</b> Compute in-degrees, start from all zero-in-degree nodes, and repeatedly remove a node and decrement its neighbors' in-degrees. If you process all <code>numCourses</code> nodes, no cycle exists and the removal order is a valid schedule. If fewer, there's a cycle → impossible.",
        "code": "public int[] findOrder(int numCourses, int[][] prereqs) {\n    List<List<Integer>> adj = new ArrayList<>();\n    int[] indeg = new int[numCourses];\n    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n    for (int[] p : prereqs) {     // p = [course, prereq]\n        adj.get(p[1]).add(p[0]);\n        indeg[p[0]]++;\n    }\n    Queue<Integer> q = new LinkedList<>();\n    for (int i = 0; i < numCourses; i++)\n        if (indeg[i] == 0) q.offer(i);\n\n    int[] order = new int[numCourses];\n    int idx = 0;\n    while (!q.isEmpty()) {\n        int cur = q.poll();\n        order[idx++] = cur;\n        for (int nxt : adj.get(cur))\n            if (--indeg[nxt] == 0) q.offer(nxt);\n    }\n    return idx == numCourses ? order : new int[0]; // empty = cycle\n}",
        "tc": "O(V+E)",
        "sc": "O(V+E)",
        "followup": "<span class='q'>DFS-based topological sort instead of Kahn's?</span> Post-order DFS with a 3-color visited state to detect cycles; reverse the finish order. <span class='q'>Detect and report the actual cycle?</span> Track the recursion path. <span class='q'>Minimum semesters with unlimited parallel courses?</span> (LC 1136) BFS by levels = longest dependency chain."
      },
      {
        "n": "04",
        "title": "Pacific Atlantic Water Flow",
        "diff": "med",
        "lc": "417",
        "pat": "Multi-source DFS",
        "statement": "Water flows from a cell to neighbors of equal/lower height. Find cells from which water can reach <b>both</b> the Pacific (top/left) and Atlantic (bottom/right) edges.",
        "example": "return list of [r,c] reaching both oceans",
        "approach": "<b>Reverse the flow: DFS inward from each ocean's border.</b> Instead of checking every cell's path to the ocean, start from ocean edges and climb to equal-or-higher cells, marking what each ocean can reach. The answer is the intersection of the two reachable sets. Reversing direction turns an expensive per-cell search into two linear flood fills.",
        "code": "private int m, n; private int[][] heights;\n\npublic List<List<Integer>> pacificAtlantic(int[][] h) {\n    heights = h; m = h.length; n = h[0].length;\n    boolean[][] pac = new boolean[m][n], atl = new boolean[m][n];\n    for (int i = 0; i < m; i++) { dfs(i, 0, pac); dfs(i, n-1, atl); }\n    for (int j = 0; j < n; j++) { dfs(0, j, pac); dfs(m-1, j, atl); }\n    List<List<Integer>> res = new ArrayList<>();\n    for (int i = 0; i < m; i++)\n        for (int j = 0; j < n; j++)\n            if (pac[i][j] && atl[i][j]) res.add(Arrays.asList(i, j));\n    return res;\n}\nprivate void dfs(int r, int c, boolean[][] seen) {\n    seen[r][c] = true;\n    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n    for (int[] d : dirs) {\n        int nr = r+d[0], nc = c+d[1];\n        if (nr>=0 && nr<m && nc>=0 && nc<n && !seen[nr][nc]\n                && heights[nr][nc] >= heights[r][c]) // climb up\n            dfs(nr, nc, seen);\n    }\n}",
        "tc": "O(m·n)",
        "sc": "O(m·n)",
        "followup": ""
      },
      {
        "n": "05",
        "title": "Word Ladder",
        "diff": "hard",
        "lc": "127",
        "pat": "BFS Shortest Path",
        "statement": "Transform <b>beginWord</b> to <b>endWord</b> changing one letter at a time; each intermediate must be in <b>wordList</b>. Return the shortest transformation length, or 0.",
        "example": "\"hit\"→\"cog\", list=[hot,dot,dog,lot,log,cog]  →  5",
        "approach": "<b>BFS where neighbors are one-letter-different words.</b> Shortest transformation = shortest path in an implicit graph, so BFS. For each word, generate all one-letter variations and check membership in the word set. Mark visited to avoid cycles. BFS guarantees the first time you reach endWord is the shortest path.",
        "code": "public int ladderLength(String begin, String end, List<String> wordList) {\n    Set<String> dict = new HashSet<>(wordList);\n    if (!dict.contains(end)) return 0;\n    Queue<String> q = new LinkedList<>();\n    q.offer(begin);\n    int steps = 1;\n    while (!q.isEmpty()) {\n        int size = q.size();\n        for (int i = 0; i < size; i++) {\n            char[] word = q.poll().toCharArray();\n            for (int j = 0; j < word.length; j++) {\n                char old = word[j];\n                for (char c = 'a'; c <= 'z'; c++) {\n                    word[j] = c;\n                    String next = new String(word);\n                    if (next.equals(end)) return steps + 1;\n                    if (dict.remove(next)) q.offer(next); // visited\n                }\n                word[j] = old;\n            }\n        }\n        steps++;\n    }\n    return 0;\n}",
        "tc": "O(N·L·26)",
        "sc": "O(N·L)",
        "followup": "<span class='q'>Return an actual shortest path?</span> (Word Ladder II, LC 126) Track parents during BFS, then backtrack — much harder. <span class='q'>Speed up the search?</span> Bidirectional BFS from both begin and end roughly halves the explored frontier. <span class='q'>Huge word list?</span> Precompute generic patterns (e.g. <code>h*t</code>) as adjacency buckets."
      },
      {
        "n": "06",
        "title": "Accounts Merge",
        "diff": "med",
        "lc": "721",
        "pat": "Union-Find",
        "statement": "Merge accounts that share any email. Each account is [name, email1, email2, …]. Same email ⟹ same person.",
        "example": "merge accounts sharing emails, output sorted emails per person",
        "approach": "<b>Union-Find on emails.</b> Union all emails within each account. Then group emails by their root representative. Map each email back to its owner's name. Sort emails within each group. Union-Find elegantly handles the transitive merging — if A shares with B and B with C, all three collapse to one component.",
        "code": "public List<List<String>> accountsMerge(List<List<String>> accounts) {\n    Map<String,String> parent = new HashMap<>();\n    Map<String,String> owner = new HashMap<>();\n    for (List<String> acc : accounts) {\n        for (int i = 1; i < acc.size(); i++) {\n            parent.putIfAbsent(acc.get(i), acc.get(i));\n            owner.put(acc.get(i), acc.get(0));\n            if (i > 1) union(parent, acc.get(i), acc.get(i-1));\n        }\n    }\n    Map<String,TreeSet<String>> groups = new HashMap<>();\n    for (String email : parent.keySet()) {\n        String root = find(parent, email);\n        groups.computeIfAbsent(root, k -> new TreeSet<>()).add(email);\n    }\n    List<List<String>> res = new ArrayList<>();\n    for (String root : groups.keySet()) {\n        List<String> merged = new ArrayList<>(groups.get(root));\n        merged.add(0, owner.get(root));\n        res.add(merged);\n    }\n    return res;\n}\nprivate String find(Map<String,String> p, String x) {\n    while (!p.get(x).equals(x)) { p.put(x, p.get(p.get(x))); x = p.get(x); }\n    return x;\n}\nprivate void union(Map<String,String> p, String a, String b) {\n    p.put(find(p, a), find(p, b));\n}",
        "tc": "O(N·α)",
        "sc": "O(N)",
        "followup": ""
      },
      {
        "n": "07",
        "title": "Network Delay Time (Dijkstra)",
        "diff": "med",
        "lc": "743",
        "pat": "Dijkstra",
        "statement": "Given directed weighted edges [u,v,w] (signal travel time), find the time for all <b>n</b> nodes to receive a signal sent from node <b>k</b>. Return -1 if unreachable.",
        "example": "times=[[2,1,1],[2,3,1],[3,4,1]], n=4, k=2  →  2",
        "approach": "<b>Dijkstra's shortest path from the source.</b> Use a min-heap of (distance, node). Always expand the closest unsettled node, relaxing its edges. The answer is the maximum shortest-distance among all nodes (the last to receive the signal). If any node is unreachable, return -1.",
        "code": "public int networkDelayTime(int[][] times, int n, int k) {\n    List<int[]>[] adj = new List[n + 1];\n    for (int i = 1; i <= n; i++) adj[i] = new ArrayList<>();\n    for (int[] t : times) adj[t[0]].add(new int[]{t[1], t[2]});\n\n    int[] dist = new int[n + 1];\n    Arrays.fill(dist, Integer.MAX_VALUE);\n    dist[k] = 0;\n    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[1] - b[1]);\n    pq.offer(new int[]{k, 0});\n\n    while (!pq.isEmpty()) {\n        int[] cur = pq.poll();\n        int node = cur[0], d = cur[1];\n        if (d > dist[node]) continue;          // stale entry\n        for (int[] e : adj[node]) {\n            int nd = d + e[1];\n            if (nd < dist[e[0]]) {\n                dist[e[0]] = nd;\n                pq.offer(new int[]{e[0], nd});\n            }\n        }\n    }\n    int max = 0;\n    for (int i = 1; i <= n; i++) {\n        if (dist[i] == Integer.MAX_VALUE) return -1;\n        max = Math.max(max, dist[i]);\n    }\n    return max;\n}",
        "tc": "O(E log V)",
        "sc": "O(V+E)",
        "followup": "<span class='q'>Negative edge weights?</span> Dijkstra breaks — switch to Bellman-Ford (O(VE)) or SPFA. <span class='q'>Detect if some node is unreachable?</span> Already handled (returns −1 on remaining infinity). <span class='q'>Dense graph?</span> An O(V²) array-based Dijkstra can beat the heap version when E ≈ V²."
      },
      {
        "n": "08",
        "title": "Rotting Oranges",
        "diff": "med",
        "lc": "994",
        "pat": "Multi-source BFS",
        "statement": "Each minute, fresh oranges (1) adjacent to a rotten one (2) rot. Return minutes until none are fresh, or -1 if impossible.",
        "example": "[[2,1,1],[1,1,0],[0,1,1]]  →  4",
        "approach": "<b>Multi-source BFS from all rotten oranges simultaneously.</b> Enqueue every initially-rotten orange, then BFS level by level — each level is one minute. Count fresh oranges; decrement as they rot. If fresh remain after BFS, return -1. Starting BFS from all sources at once naturally models simultaneous spreading.",
        "code": "public int orangesRotting(int[][] grid) {\n    int m = grid.length, n = grid[0].length, fresh = 0;\n    Queue<int[]> q = new LinkedList<>();\n    for (int r = 0; r < m; r++)\n        for (int c = 0; c < n; c++) {\n            if (grid[r][c] == 2) q.offer(new int[]{r, c});\n            else if (grid[r][c] == 1) fresh++;\n        }\n    if (fresh == 0) return 0;\n    int minutes = 0;\n    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};\n    while (!q.isEmpty() && fresh > 0) {\n        minutes++;\n        int size = q.size();\n        for (int i = 0; i < size; i++) {\n            int[] cur = q.poll();\n            for (int[] d : dirs) {\n                int nr = cur[0]+d[0], nc = cur[1]+d[1];\n                if (nr>=0 && nr<m && nc>=0 && nc<n && grid[nr][nc]==1) {\n                    grid[nr][nc] = 2; fresh--;\n                    q.offer(new int[]{nr, nc});\n                }\n            }\n        }\n    }\n    return fresh == 0 ? minutes : -1;\n}",
        "tc": "O(m·n)",
        "sc": "O(m·n)",
        "followup": "<span class='q'>Return which orange rots last / the full timeline?</span> Tag each cell with the minute it rotted during BFS. <span class='q'>Diagonal spread allowed?</span> Add the 4 diagonal directions. <span class='q'>Multiple rot sources with different speeds?</span> Becomes a weighted multi-source shortest path (Dijkstra-style)."
      }
    ]
  },
  {
    "id": "dp",
    "name": "Dynamic Programming",
    "meta": "most feared · pattern recognition wins",
    "intro": "DP intimidates people, but it's really <b>\"define the state, find the recurrence, pick a direction.\"</b> The hard part is the state definition — once you have <code>dp[i]</code> meaning something precise, the transition usually follows. Practice recognizing the <b>family</b>: 1D sequence, 2D grid/two-string, knapsack, interval. Most DP here is medium once you see the pattern.",
    "problems": [
      {
        "n": "01",
        "title": "Climbing Stairs",
        "diff": "easy",
        "lc": "70",
        "pat": "1D DP / Fibonacci",
        "statement": "You climb <b>n</b> stairs taking 1 or 2 steps at a time. How many distinct ways to reach the top?",
        "example": "n=3  →  3  (1+1+1, 1+2, 2+1)",
        "approach": "<b>Ways to reach step i = ways to reach i-1 + ways to reach i-2.</b> To land on step i, your last move was either +1 (from i-1) or +2 (from i-2). That's the Fibonacci recurrence. Only the last two values matter, so collapse to O(1) space. This is the gateway DP problem — internalize the \"last move\" reasoning.",
        "code": "public int climbStairs(int n) {\n    int prev2 = 1, prev1 = 1;  // ways to reach step 0 and 1\n    for (int i = 2; i <= n; i++) {\n        int cur = prev1 + prev2;\n        prev2 = prev1;\n        prev1 = cur;\n    }\n    return prev1;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>What if you can take 1..k steps?</span> Sum the previous k dp values (sliding window of a generalized Fibonacci). <span class='q'>Cost on each step (LC 746)?</span> dp[i] = cost[i] + min(dp[i-1], dp[i-2]). <span class='q'>Count distinct paths with forbidden steps?</span> Zero out dp at blocked indices."
      },
      {
        "n": "02",
        "title": "House Robber (I & II)",
        "diff": "med",
        "lc": "198 / 213",
        "pat": "1D DP",
        "statement": "Rob houses for max money, but you can't rob two <b>adjacent</b> houses. Part II: houses are in a <b>circle</b> (first and last are adjacent).",
        "example": "[2,7,9,3,1]  →  12  (rob houses 0,2,4)",
        "approach": "<b>At each house: skip it (keep prev best) or rob it (prev-prev best + current).</b> <code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>. For the circular version, the first and last can't both be robbed — so run the linear solution twice: once excluding the first house, once excluding the last, and take the max.",
        "code": "public int rob(int[] nums) {\n    int prev2 = 0, prev1 = 0;\n    for (int n : nums) {\n        int cur = Math.max(prev1, prev2 + n); // skip or rob\n        prev2 = prev1;\n        prev1 = cur;\n    }\n    return prev1;\n}\n// House Robber II (circular)\npublic int robCircular(int[] nums) {\n    if (nums.length == 1) return nums[0];\n    return Math.max(\n        robRange(nums, 0, nums.length - 2),   // exclude last\n        robRange(nums, 1, nums.length - 1));  // exclude first\n}\nprivate int robRange(int[] nums, int lo, int hi) {\n    int prev2 = 0, prev1 = 0;\n    for (int i = lo; i <= hi; i++) {\n        int cur = Math.max(prev1, prev2 + nums[i]);\n        prev2 = prev1; prev1 = cur;\n    }\n    return prev1;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": ""
      },
      {
        "n": "03",
        "title": "Coin Change",
        "diff": "med",
        "lc": "322",
        "pat": "Unbounded Knapsack",
        "statement": "Given <b>coins</b> of various denominations and an <b>amount</b>, return the fewest coins needed to make that amount, or -1 if impossible.",
        "example": "coins=[1,2,5], amount=11  →  3  (5+5+1)",
        "approach": "<b>dp[a] = min coins to make amount a.</b> For each amount from 1 to target, try every coin: if the coin fits, <code>dp[a] = min(dp[a], dp[a-coin] + 1)</code>. Initialize dp to \"infinity\" (amount+1) so unreachable amounts stay invalid. Bottom-up builds every sub-amount once. This is the canonical unbounded-knapsack template.",
        "code": "public int coinChange(int[] coins, int amount) {\n    int[] dp = new int[amount + 1];\n    Arrays.fill(dp, amount + 1);   // \"infinity\"\n    dp[0] = 0;\n    for (int a = 1; a <= amount; a++)\n        for (int coin : coins)\n            if (coin <= a)\n                dp[a] = Math.min(dp[a], dp[a - coin] + 1);\n    return dp[amount] > amount ? -1 : dp[amount];\n}",
        "tc": "O(amount·coins)",
        "sc": "O(amount)",
        "followup": "<span class='q'>Count the number of ways to make the amount?</span> (LC 518) Loop coins outer, amounts inner — order matters to avoid counting permutations. <span class='q'>Return the actual coins used?</span> Store a parent/choice array. <span class='q'>Amount is huge but few coin types?</span> Consider matrix-exponentiation or BFS on residues."
      },
      {
        "n": "04",
        "title": "Longest Increasing Subsequence",
        "diff": "med",
        "lc": "300",
        "pat": "1D DP / Binary Search",
        "statement": "Return the length of the longest strictly increasing subsequence of <b>nums</b>.",
        "example": "[10,9,2,5,3,7,101,18]  →  4  ([2,3,7,101])",
        "approach": "<b>O(n log n) patience sorting.</b> Maintain a <code>tails</code> array where tails[i] is the smallest possible tail of an increasing subsequence of length i+1. For each number, binary-search its insertion point: if it extends the longest run, append; otherwise replace the first tail ≥ it (keeping tails minimal for future extension). The length of tails is the answer.",
        "code": "public int lengthOfLIS(int[] nums) {\n    List<Integer> tails = new ArrayList<>();\n    for (int n : nums) {\n        int lo = 0, hi = tails.size();\n        while (lo < hi) {                // lower bound\n            int mid = (lo + hi) / 2;\n            if (tails.get(mid) < n) lo = mid + 1;\n            else hi = mid;\n        }\n        if (lo == tails.size()) tails.add(n);   // extend\n        else tails.set(lo, n);                  // replace\n    }\n    return tails.size();\n}",
        "tc": "O(n log n)",
        "sc": "O(n)",
        "followup": "<span class='q'>Reconstruct the actual subsequence?</span> Keep a parent-index array alongside the tails. <span class='q'>Count the number of LIS?</span> (LC 673) Track length and count arrays. <span class='q'>Why does the O(n log n) tails array work?</span> Be ready to explain that tails isn't the LIS itself but the smallest tail per length — a classic probe."
      },
      {
        "n": "05",
        "title": "Word Break",
        "diff": "med",
        "lc": "139",
        "pat": "1D DP",
        "statement": "Given a string <b>s</b> and a dictionary <b>wordDict</b>, return true if s can be segmented into a space-separated sequence of dictionary words.",
        "example": "s=\"leetcode\", dict=[\"leet\",\"code\"]  →  true",
        "approach": "<b>dp[i] = can the prefix of length i be segmented?</b> dp[0] = true (empty string). For each position i, check every earlier position j: if dp[j] is true and the substring s[j..i] is in the dictionary, then dp[i] is true. Build left to right. The answer is dp[length]. A HashSet for the dictionary keeps lookups O(1).",
        "code": "public boolean wordBreak(String s, List<String> wordDict) {\n    Set<String> dict = new HashSet<>(wordDict);\n    int n = s.length();\n    boolean[] dp = new boolean[n + 1];\n    dp[0] = true;                     // empty prefix\n    for (int i = 1; i <= n; i++)\n        for (int j = 0; j < i; j++)\n            if (dp[j] && dict.contains(s.substring(j, i))) {\n                dp[i] = true;\n                break;\n            }\n    return dp[n];\n}",
        "tc": "O(n²·L)",
        "sc": "O(n)",
        "followup": ""
      },
      {
        "n": "06",
        "title": "Unique Paths (I & II)",
        "diff": "med",
        "lc": "62 / 63",
        "pat": "2D Grid DP",
        "statement": "Count paths from top-left to bottom-right of an m×n grid, moving only right or down. Part II adds obstacles (blocked cells).",
        "example": "m=3, n=7  →  28",
        "approach": "<b>dp[i][j] = paths to reach cell (i,j) = dp[i-1][j] + dp[i][j-1].</b> You arrive at any cell either from above or from the left, so sum those. The first row and column are all 1 (only one straight path). For obstacles, set blocked cells' path count to 0. Can be space-optimized to a single row.",
        "code": "public int uniquePaths(int m, int n) {\n    int[] dp = new int[n];\n    Arrays.fill(dp, 1);            // first row all 1s\n    for (int i = 1; i < m; i++)\n        for (int j = 1; j < n; j++)\n            dp[j] += dp[j - 1];     // from above + from left\n    return dp[n - 1];\n}\n// With obstacles: if grid[i][j]==1 set dp[j]=0",
        "tc": "O(m·n)",
        "sc": "O(n)",
        "followup": ""
      },
      {
        "n": "07",
        "title": "Edit Distance",
        "diff": "hard",
        "lc": "72",
        "pat": "2D String DP",
        "statement": "Find the minimum number of operations (insert, delete, replace) to convert <b>word1</b> into <b>word2</b>.",
        "example": "\"horse\" → \"ros\"  →  3",
        "approach": "<b>dp[i][j] = edits to convert first i chars of word1 to first j of word2.</b> If the current chars match, no new edit: <code>dp[i-1][j-1]</code>. Otherwise take 1 + the min of three options: replace (diagonal), delete (up), insert (left). Base cases: converting to/from an empty string costs that string's length. The three-way min is the heart of it.",
        "code": "public int minDistance(String w1, String w2) {\n    int m = w1.length(), n = w2.length();\n    int[][] dp = new int[m + 1][n + 1];\n    for (int i = 0; i <= m; i++) dp[i][0] = i; // delete all\n    for (int j = 0; j <= n; j++) dp[0][j] = j; // insert all\n    for (int i = 1; i <= m; i++)\n        for (int j = 1; j <= n; j++) {\n            if (w1.charAt(i-1) == w2.charAt(j-1))\n                dp[i][j] = dp[i-1][j-1];        // no edit\n            else\n                dp[i][j] = 1 + Math.min(dp[i-1][j-1], // replace\n                          Math.min(dp[i-1][j],          // delete\n                                   dp[i][j-1]));       // insert\n        }\n    return dp[m][n];\n}",
        "tc": "O(m·n)",
        "sc": "O(m·n)",
        "followup": "<span class='q'>Reduce space to O(n)?</span> Only the previous row is needed — roll two 1D arrays. <span class='q'>Recover the actual edit operations?</span> Backtrack through the dp table from (m,n). <span class='q'>Weighted operations (insert ≠ delete ≠ replace cost)?</span> Plug the costs into the three-way min."
      },
      {
        "n": "08",
        "title": "Longest Common Subsequence",
        "diff": "med",
        "lc": "1143",
        "pat": "2D String DP",
        "statement": "Return the length of the longest subsequence common to both strings <b>text1</b> and <b>text2</b>.",
        "example": "\"abcde\", \"ace\"  →  3  (\"ace\")",
        "approach": "<b>dp[i][j] = LCS length of the first i of A and first j of B.</b> If the current characters match, extend the diagonal: <code>dp[i-1][j-1] + 1</code>. If not, carry forward the better of dropping one char from either string: <code>max(dp[i-1][j], dp[i][j-1])</code>. This match/no-match branch is the universal two-string DP skeleton — edit distance is its cousin.",
        "code": "public int longestCommonSubsequence(String a, String b) {\n    int m = a.length(), n = b.length();\n    int[][] dp = new int[m + 1][n + 1];\n    for (int i = 1; i <= m; i++)\n        for (int j = 1; j <= n; j++) {\n            if (a.charAt(i-1) == b.charAt(j-1))\n                dp[i][j] = dp[i-1][j-1] + 1; // match\n            else\n                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n        }\n    return dp[m][n];\n}",
        "tc": "O(m·n)",
        "sc": "O(m·n)",
        "followup": ""
      },
      {
        "n": "09",
        "title": "Partition Equal Subset Sum",
        "diff": "med",
        "lc": "416",
        "pat": "0/1 Knapsack",
        "statement": "Determine if <b>nums</b> can be partitioned into two subsets with equal sum.",
        "example": "[1,5,11,5]  →  true  ([1,5,5] and [11])",
        "approach": "<b>Reduces to: can we pick a subset summing to total/2?</b> If the total is odd, immediately false. Otherwise it's a 0/1 knapsack: <code>dp[s]</code> = can we form sum s? For each number, update sums from high to low (so each number is used once). The answer is dp[target]. The high-to-low iteration is the key 0/1 detail.",
        "code": "public boolean canPartition(int[] nums) {\n    int total = 0;\n    for (int n : nums) total += n;\n    if (total % 2 != 0) return false;\n    int target = total / 2;\n    boolean[] dp = new boolean[target + 1];\n    dp[0] = true;\n    for (int n : nums)\n        for (int s = target; s >= n; s--) // high→low: use n once\n            dp[s] = dp[s] || dp[s - n];\n    return dp[target];\n}",
        "tc": "O(n·sum)",
        "sc": "O(sum)",
        "followup": "<span class='q'>Split into k equal subsets?</span> (LC 698) Backtracking with pruning, not simple DP. <span class='q'>Minimize the difference between two subsets?</span> (LC 1049) Same knapsack, find the achievable sum closest to total/2. <span class='q'>Return the actual partition?</span> Backtrack through the boolean dp."
      },
      {
        "n": "10",
        "title": "Maximum Product Subarray",
        "diff": "med",
        "lc": "152",
        "pat": "1D DP (track min+max)",
        "statement": "Find the contiguous subarray with the largest <b>product</b> and return that product.",
        "example": "[2,3,-2,4]  →  6  ([2,3])",
        "approach": "<b>Track both the max and min product ending here</b> — because a negative number flips them. A large negative min can become the max when multiplied by another negative. At each step, compute candidates from current × prevMax, current × prevMin, and current alone; the new max/min come from these. The min-tracking is what makes products different from sums.",
        "code": "public int maxProduct(int[] nums) {\n    int max = nums[0], min = nums[0], result = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        int n = nums[i];\n        if (n < 0) { int t = max; max = min; min = t; } // swap on negative\n        max = Math.max(n, max * n);\n        min = Math.min(n, min * n);\n        result = Math.max(result, max);\n    }\n    return result;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": ""
      }
    ]
  },
  {
    "id": "heaps",
    "name": "Heaps & Priority Queue",
    "meta": "top-K · merge-K · streaming",
    "intro": "Reach for a heap whenever you see <b>\"top K\", \"K closest\", \"K most frequent\", \"merge K\", or \"running median\".</b> A heap gives you the min or max in O(1) and reorders in O(log n). In Java, <code>PriorityQueue</code> is a min-heap; flip the comparator for max-heap. The size-K-heap trick beats full sorting for top-K queries.",
    "problems": [
      {
        "n": "01",
        "title": "Kth Largest Element in an Array",
        "diff": "med",
        "lc": "215",
        "pat": "Min-Heap size K",
        "statement": "Return the <b>k</b>th largest element in an unsorted array (the kth largest in sorted order, not the kth distinct).",
        "example": "[3,2,1,5,6,4], k=2  →  5",
        "approach": "<b>Maintain a min-heap of size k.</b> Push elements; when the heap exceeds k, poll the smallest. After processing all, the heap's top is the kth largest — because the k largest elements remain and the smallest of those is at the root. O(n log k), better than sorting's O(n log n). (Quickselect gives O(n) average — worth mentioning.)",
        "code": "public int findKthLargest(int[] nums, int k) {\n    PriorityQueue<Integer> minHeap = new PriorityQueue<>();\n    for (int n : nums) {\n        minHeap.offer(n);\n        if (minHeap.size() > k) minHeap.poll(); // drop smallest\n    }\n    return minHeap.peek();           // kth largest\n}",
        "tc": "O(n log k)",
        "sc": "O(k)",
        "followup": "<span class='q'>Can you do better than O(n log k)?</span> Quickselect averages O(n) — be ready to write the partition. <span class='q'>What if it's a stream and k is fixed?</span> (LC 703) Keep a size-k min-heap that updates in O(log k) per element. <span class='q'>Worst-case O(n) guaranteed?</span> Median-of-medians pivot selection."
      },
      {
        "n": "02",
        "title": "Top K Frequent Elements",
        "diff": "med",
        "lc": "347",
        "pat": "Heap / Bucket Sort",
        "statement": "Return the <b>k</b> most frequent elements in <b>nums</b>.",
        "example": "[1,1,1,2,2,3], k=2  →  [1,2]",
        "approach": "<b>Count frequencies, then bucket sort by frequency.</b> A frequency can be at most n, so create n+1 buckets indexed by frequency. Place each number in the bucket matching its count. Walk buckets from high frequency down, collecting until you have k. This is O(n) — better than the O(n log k) heap approach, and a great optimization to show.",
        "code": "public int[] topKFrequent(int[] nums, int k) {\n    Map<Integer,Integer> freq = new HashMap<>();\n    for (int n : nums) freq.merge(n, 1, Integer::sum);\n\n    List<Integer>[] buckets = new List[nums.length + 1];\n    for (int num : freq.keySet()) {\n        int f = freq.get(num);\n        if (buckets[f] == null) buckets[f] = new ArrayList<>();\n        buckets[f].add(num);\n    }\n    int[] res = new int[k];\n    int idx = 0;\n    for (int f = buckets.length - 1; f >= 0 && idx < k; f--)\n        if (buckets[f] != null)\n            for (int num : buckets[f])\n                if (idx < k) res[idx++] = num;\n    return res;\n}",
        "tc": "O(n)",
        "sc": "O(n)",
        "followup": "<span class='q'>Streaming data?</span> A size-k heap maintains top-k online in O(log k) per element. <span class='q'>Why is bucket sort O(n) here?</span> Frequencies are bounded by n, so you skip comparison sorting. <span class='q'>Top k frequent words with tie-breaking?</span> (LC 692) Add lexicographic ordering into the comparator."
      },
      {
        "n": "03",
        "title": "Find Median from Data Stream",
        "diff": "hard",
        "lc": "295",
        "pat": "Two Heaps",
        "statement": "Design a structure supporting <b>addNum(num)</b> and <b>findMedian()</b> over a growing stream of integers.",
        "example": "add 1, add 2, median=1.5, add 3, median=2",
        "approach": "<b>A max-heap for the lower half, a min-heap for the upper half.</b> Keep them balanced in size (differ by at most 1). The median is the top of the larger heap, or the average of both tops if equal. Adding: push to one heap, rebalance by moving a top across. This keeps both halves sorted \"just enough\" for O(1) median.",
        "code": "class MedianFinder {\n    private PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder()); // max-heap\n    private PriorityQueue<Integer> hi = new PriorityQueue<>();                           // min-heap\n\n    public void addNum(int num) {\n        lo.offer(num);\n        hi.offer(lo.poll());          // balance values across\n        if (hi.size() > lo.size())   // balance sizes\n            lo.offer(hi.poll());\n    }\n    public double findMedian() {\n        if (lo.size() > hi.size()) return lo.peek();\n        return (lo.peek() + hi.peek()) / 2.0;\n    }\n}",
        "tc": "O(log n) add",
        "sc": "O(n)",
        "followup": ""
      },
      {
        "n": "04",
        "title": "K Closest Points to Origin",
        "diff": "med",
        "lc": "973",
        "pat": "Max-Heap size K",
        "statement": "Given <b>points</b> on a plane, return the <b>k</b> closest to the origin (0,0).",
        "example": "[[1,3],[-2,2]], k=1  →  [[-2,2]]",
        "approach": "<b>Max-heap of size k keyed by squared distance.</b> Push points; when the heap exceeds k, poll the farthest. Use squared distance (no sqrt needed — comparisons are identical). What remains is the k closest. O(n log k). The \"max-heap to evict the worst\" mirrors the kth-largest min-heap trick, just inverted.",
        "code": "public int[][] kClosest(int[][] points, int k) {\n    PriorityQueue<int[]> pq = new PriorityQueue<>(\n        (a, b) -> (b[0]*b[0] + b[1]*b[1])\n               - (a[0]*a[0] + a[1]*a[1]));  // max-heap by dist²\n    for (int[] p : points) {\n        pq.offer(p);\n        if (pq.size() > k) pq.poll();  // evict farthest\n    }\n    return pq.toArray(new int[0][]);\n}",
        "tc": "O(n log k)",
        "sc": "O(k)",
        "followup": "<span class='q'>Values fall in a small fixed range (e.g. ages 0-100)?</span> A counting/bucket array gives O(1) updates and median lookup. <span class='q'>Sliding-window median?</span> (LC 480) Two heaps plus lazy deletion, or a balanced BST / TreeMap. <span class='q'>Memory-constrained huge stream?</span> Approximate with t-digest or reservoir sampling."
      },
      {
        "n": "05",
        "title": "Task Scheduler",
        "diff": "med",
        "lc": "621",
        "pat": "Greedy + Heap/Math",
        "statement": "Given task labels and a cooldown <b>n</b> (same task must be n intervals apart), return the minimum intervals to finish all tasks (including idles).",
        "example": "tasks=[\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n=2  →  8",
        "approach": "<b>The most frequent task dictates the skeleton.</b> Arrange the max-frequency task with n gaps between copies, then fill gaps with other tasks. Formula: <code>(maxFreq-1)·(n+1) + (#tasks tied for max)</code>, but never less than the total task count. This greedy/math insight beats the simulation approach. (A heap simulation also works and is more intuitive to derive live.)",
        "code": "public int leastInterval(char[] tasks, int n) {\n    int[] freq = new int[26];\n    for (char t : tasks) freq[t - 'A']++;\n    int maxFreq = 0, maxCount = 0;\n    for (int f : freq) {\n        if (f > maxFreq) { maxFreq = f; maxCount = 1; }\n        else if (f == maxFreq) maxCount++;\n    }\n    // skeleton: (maxFreq-1) blocks of size (n+1), plus the final row\n    int slots = (maxFreq - 1) * (n + 1) + maxCount;\n    return Math.max(slots, tasks.length);\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Beat O(n log k)?</span> Quickselect on squared distance averages O(n). <span class='q'>Streaming points?</span> Maintain a size-k max-heap. <span class='q'>Why squared distance?</span> Be ready to note sqrt is monotonic so it's unnecessary and avoids floating-point error."
      },
      {
        "n": "06",
        "title": "Meeting Rooms II",
        "diff": "med",
        "lc": "253",
        "pat": "Heap / Sweep Line",
        "statement": "Given meeting <b>intervals</b>, return the minimum number of conference rooms required.",
        "example": "[[0,30],[5,10],[15,20]]  →  2",
        "approach": "<b>Min-heap of end times.</b> Sort meetings by start. For each meeting, if the earliest-ending ongoing meeting (heap top) finishes before this one starts, reuse that room (poll it). Always push the current meeting's end. The heap size at any point is the rooms in use; its maximum is the answer. Tracks overlapping meetings elegantly.",
        "code": "public int minMeetingRooms(int[][] intervals) {\n    Arrays.sort(intervals, (a, b) -> a[0] - b[0]); // by start\n    PriorityQueue<Integer> ends = new PriorityQueue<>(); // end times\n    for (int[] meet : intervals) {\n        if (!ends.isEmpty() && ends.peek() <= meet[0])\n            ends.poll();              // reuse a freed room\n        ends.offer(meet[1]);\n    }\n    return ends.size();             // peak concurrent rooms\n}",
        "tc": "O(n log n)",
        "sc": "O(n)",
        "followup": "<span class='q'>Just need yes/no 'can attend all'?</span> (Meeting Rooms I) Sort and check any overlap. <span class='q'>Which meetings go in which room?</span> Assign each to the freed room you popped. <span class='q'>Sweep-line alternative?</span> Sort start and end times separately, walk both with a running counter — O(n log n) and often cleaner than the heap."
      }
    ]
  },
  {
    "id": "backtrack",
    "name": "Backtracking",
    "meta": "choose → explore → un-choose",
    "intro": "Every backtracking problem is the <b>same skeleton</b>: make a choice, recurse, undo the choice. Subsets, permutations, combinations, N-Queens, word search — identical shape, different constraints. The three variants: <b>start index</b> (combinations, avoid reuse), <b>used array</b> (permutations), and <b>in-place marking</b> (grids). Master the template and these become mechanical.",
    "problems": [
      {
        "n": "01",
        "title": "Subsets",
        "diff": "med",
        "lc": "78",
        "pat": "Backtracking (start index)",
        "statement": "Return all possible subsets (the power set) of a set of distinct integers <b>nums</b>.",
        "example": "[1,2,3]  →  [[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]",
        "approach": "<b>Every node in the recursion tree is a valid subset.</b> Use a start index to only consider elements after the current one (prevents duplicates and ordering issues). Add the current path to results at every call. Then for each remaining element: choose it, recurse with the next start, un-choose. The \"add at every node\" is what distinguishes subsets from fixed-size combinations.",
        "code": "public List<List<Integer>> subsets(int[] nums) {\n    List<List<Integer>> res = new ArrayList<>();\n    backtrack(nums, 0, new ArrayList<>(), res);\n    return res;\n}\nprivate void backtrack(int[] nums, int start,\n                       List<Integer> path, List<List<Integer>> res) {\n    res.add(new ArrayList<>(path));   // every node = a subset\n    for (int i = start; i < nums.length; i++) {\n        path.add(nums[i]);              // choose\n        backtrack(nums, i + 1, path, res); // explore\n        path.remove(path.size() - 1);   // un-choose\n    }\n}",
        "tc": "O(n·2ⁿ)",
        "sc": "O(n)",
        "followup": "<span class='q'>Array contains duplicates?</span> (LC 90) Sort first, then skip <code>i>start && nums[i]==nums[i-1]</code> to avoid duplicate subsets. <span class='q'>Iterative or bitmask generation?</span> Each of the 2ⁿ bitmasks maps to one subset — a clean non-recursive alternative. <span class='q'>Only subsets of size k?</span> Stop recursing past depth k."
      },
      {
        "n": "02",
        "title": "Permutations",
        "diff": "med",
        "lc": "46",
        "pat": "Backtracking (used array)",
        "statement": "Return all possible permutations of distinct integers <b>nums</b>.",
        "example": "[1,2,3]  →  6 permutations",
        "approach": "<b>No start index — a used[] array tracks what's in the current path.</b> At each level, try every unused element. When the path reaches full length, it's a complete permutation — record it. The choose/un-choose flips the used flag. Unlike subsets, order matters and every element participates, so we can't restrict by index.",
        "code": "public List<List<Integer>> permute(int[] nums) {\n    List<List<Integer>> res = new ArrayList<>();\n    backtrack(nums, new ArrayList<>(), new boolean[nums.length], res);\n    return res;\n}\nprivate void backtrack(int[] nums, List<Integer> path,\n                       boolean[] used, List<List<Integer>> res) {\n    if (path.size() == nums.length) {\n        res.add(new ArrayList<>(path));\n        return;\n    }\n    for (int i = 0; i < nums.length; i++) {\n        if (used[i]) continue;\n        used[i] = true; path.add(nums[i]);\n        backtrack(nums, path, used, res);\n        used[i] = false; path.remove(path.size() - 1);\n    }\n}",
        "tc": "O(n·n!)",
        "sc": "O(n)",
        "followup": "<span class='q'>Array has duplicates?</span> (LC 47) Sort and skip used-duplicate branches. <span class='q'>Generate the kth permutation only?</span> Factorial number system, no full enumeration. <span class='q'>In-place via swapping?</span> Swap-based backtracking avoids the used[] array and the path list."
      },
      {
        "n": "03",
        "title": "Combination Sum",
        "diff": "med",
        "lc": "39",
        "pat": "Backtracking (reuse allowed)",
        "statement": "Given distinct <b>candidates</b> and a <b>target</b>, return all unique combinations summing to target. The same number may be reused unlimited times.",
        "example": "candidates=[2,3,6,7], target=7  →  [[2,2,3],[7]]",
        "approach": "<b>Like subsets, but you can reuse the current element.</b> Pass <code>i</code> (not <code>i+1</code>) when recursing so the same candidate can be picked again. Subtract from the remaining target; when it hits 0, record the combination; if it goes negative, prune. The start index still prevents duplicate combinations in different orders.",
        "code": "public List<List<Integer>> combinationSum(int[] candidates, int target) {\n    List<List<Integer>> res = new ArrayList<>();\n    backtrack(candidates, target, 0, new ArrayList<>(), res);\n    return res;\n}\nprivate void backtrack(int[] c, int remain, int start,\n                       List<Integer> path, List<List<Integer>> res) {\n    if (remain == 0) { res.add(new ArrayList<>(path)); return; }\n    if (remain < 0) return;               // prune\n    for (int i = start; i < c.length; i++) {\n        path.add(c[i]);\n        backtrack(c, remain - c[i], i, path, res); // i, not i+1 → reuse\n        path.remove(path.size() - 1);\n    }\n}",
        "tc": "O(2^target)",
        "sc": "O(target)",
        "followup": ""
      },
      {
        "n": "04",
        "title": "Word Search",
        "diff": "med",
        "lc": "79",
        "pat": "Grid DFS Backtracking",
        "statement": "Given a 2D <b>board</b> and a <b>word</b>, return true if the word exists in the grid via sequentially adjacent cells (no cell reused).",
        "example": "board=[[\"A\",\"B\",\"C\",\"E\"],...], word=\"ABCCED\"  →  true",
        "approach": "<b>DFS from each cell, marking visited in place.</b> Try to match the word character by character, moving to adjacent cells. Temporarily mark the current cell (e.g. set to '#') so the path can't reuse it, recurse in four directions, then restore it on backtrack. Return true as soon as any path matches the whole word. The restore step is essential — other start cells need the grid intact.",
        "code": "public boolean exist(char[][] board, String word) {\n    for (int r = 0; r < board.length; r++)\n        for (int c = 0; c < board[0].length; c++)\n            if (dfs(board, word, r, c, 0)) return true;\n    return false;\n}\nprivate boolean dfs(char[][] b, String w, int r, int c, int i) {\n    if (i == w.length()) return true;       // matched all\n    if (r < 0 || r >= b.length || c < 0 || c >= b[0].length\n            || b[r][c] != w.charAt(i)) return false;\n    char tmp = b[r][c];\n    b[r][c] = '#';                       // mark visited\n    boolean found = dfs(b, w, r+1, c, i+1) || dfs(b, w, r-1, c, i+1)\n                 || dfs(b, w, r, c+1, i+1) || dfs(b, w, r, c-1, i+1);\n    b[r][c] = tmp;                       // restore (backtrack)\n    return found;\n}",
        "tc": "O(m·n·4^L)",
        "sc": "O(L)",
        "followup": "<span class='q'>Search many words at once?</span> (Word Search II, LC 212) Build a Trie of all words and DFS the grid once, pruning by Trie paths — far faster than searching each word separately. This Trie follow-up is extremely common. <span class='q'>Can cells be reused?</span> Drop the in-place marking."
      },
      {
        "n": "05",
        "title": "N-Queens",
        "diff": "hard",
        "lc": "51",
        "pat": "Backtracking + Pruning",
        "statement": "Place <b>n</b> queens on an n×n board so none attack each other. Return all distinct solutions.",
        "example": "n=4  →  2 distinct board configurations",
        "approach": "<b>Place one queen per row; track attacked columns and diagonals.</b> Recurse row by row. For each row, try each column that isn't under attack. Track three sets: occupied columns, \"↘\" diagonals (row−col constant), and \"↙\" diagonals (row+col constant) — O(1) conflict checks. Place, recurse to the next row, then remove. The diagonal encoding is the clever part.",
        "code": "public List<List<String>> solveNQueens(int n) {\n    List<List<String>> res = new ArrayList<>();\n    int[] queens = new int[n];        // queens[row] = col\n    backtrack(0, n, queens, new HashSet<>(), new HashSet<>(), new HashSet<>(), res);\n    return res;\n}\nprivate void backtrack(int row, int n, int[] queens,\n        Set<Integer> cols, Set<Integer> diag1, Set<Integer> diag2,\n        List<List<String>> res) {\n    if (row == n) { res.add(buildBoard(queens, n)); return; }\n    for (int col = 0; col < n; col++) {\n        int d1 = row - col, d2 = row + col;\n        if (cols.contains(col) || diag1.contains(d1) || diag2.contains(d2))\n            continue;                    // under attack\n        queens[row] = col;\n        cols.add(col); diag1.add(d1); diag2.add(d2);\n        backtrack(row + 1, n, queens, cols, diag1, diag2, res);\n        cols.remove(col); diag1.remove(d1); diag2.remove(d2);\n    }\n}\nprivate List<String> buildBoard(int[] queens, int n) {\n    List<String> board = new ArrayList<>();\n    for (int r = 0; r < n; r++) {\n        char[] row = new char[n];\n        Arrays.fill(row, '.');\n        row[queens[r]] = 'Q';\n        board.add(new String(row));\n    }\n    return board;\n}",
        "tc": "O(n!)",
        "sc": "O(n)",
        "followup": "<span class='q'>Only need the count of solutions?</span> (LC 52) Skip board construction; just increment a counter — and you can use bitmasks for columns/diagonals to make it blazing fast. <span class='q'>How far does it scale?</span> Bitmask backtracking handles n up to ~15 reasonably; beyond that it's exponential."
      }
    ]
  },
  {
    "id": "binsearch",
    "name": "Binary Search",
    "meta": "sorted data · search on answer",
    "intro": "Binary search is more than \"find in a sorted array.\" The senior-level skill is recognizing the <b>\"search on the answer\"</b> pattern — when the answer lives in a numeric range and you can check feasibility in O(n). Memorize the <b>lower-bound template</b> (<code>lo &lt; hi</code>, <code>hi = mid</code>) — it solves first/last position, insert point, and boundary problems with one shape.",
    "problems": [
      {
        "n": "01",
        "title": "Binary Search",
        "diff": "easy",
        "lc": "704",
        "pat": "Classic",
        "statement": "Given a sorted array <b>nums</b> and a <b>target</b>, return its index or -1. Must be O(log n).",
        "example": "nums=[-1,0,3,5,9,12], target=9  →  4",
        "approach": "<b>The canonical template.</b> Maintain <code>lo &lt;= hi</code>. Compute mid as <code>lo + (hi-lo)/2</code> to avoid integer overflow. If nums[mid] equals target, done; if smaller, search right (lo = mid+1); if larger, search left (hi = mid-1). The overflow-safe mid is a detail reviewers specifically look for.",
        "code": "public int search(int[] nums, int target) {\n    int lo = 0, hi = nums.length - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2; // overflow-safe\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}",
        "tc": "O(log n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Find insertion position if absent?</span> (LC 35) Return <code>lo</code> after the loop instead of −1. <span class='q'>First or last occurrence with duplicates?</span> Use the lower/upper-bound template (see Find First and Last). <span class='q'>Why <code>lo + (hi-lo)/2</code>?</span> Be ready to explain it avoids integer overflow that <code>(lo+hi)/2</code> risks."
      },
      {
        "n": "02",
        "title": "Find First and Last Position",
        "diff": "med",
        "lc": "34",
        "pat": "Lower/Upper Bound",
        "statement": "Given a sorted array with possible duplicates, find the starting and ending index of a <b>target</b>. Return [-1,-1] if absent.",
        "example": "nums=[5,7,7,8,8,10], target=8  →  [3,4]",
        "approach": "<b>Two binary searches: leftmost and rightmost.</b> The lower-bound search finds the first index ≥ target. The upper-bound search finds the first index > target, minus one gives the last occurrence. Both use the <code>lo &lt; hi</code>, <code>hi = mid</code> template with a tweaked comparison. This decomposition into two boundary searches is the clean approach.",
        "code": "public int[] searchRange(int[] nums, int target) {\n    int left = lowerBound(nums, target);\n    if (left == nums.length || nums[left] != target)\n        return new int[]{-1, -1};\n    int right = lowerBound(nums, target + 1) - 1;\n    return new int[]{left, right};\n}\nprivate int lowerBound(int[] nums, int target) {\n    int lo = 0, hi = nums.length;     // hi = length\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] < target) lo = mid + 1;\n        else hi = mid;                  // keep mid\n    }\n    return lo;\n}",
        "tc": "O(log n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Count occurrences of the target?</span> last − first + 1. <span class='q'>Why two searches instead of one expand-around-mid?</span> Expanding from a found mid is O(n) worst case (all duplicates); two bounded searches stay O(log n). <span class='q'>Search a rotated array with duplicates?</span> Combine with the rotated-array logic."
      },
      {
        "n": "03",
        "title": "Search a 2D Matrix",
        "diff": "med",
        "lc": "74",
        "pat": "Binary Search",
        "statement": "Search a <b>target</b> in an m×n matrix where each row is sorted and the first element of each row exceeds the last of the previous row.",
        "example": "target found anywhere in the sorted-flattened matrix  →  true",
        "approach": "<b>Treat the matrix as one sorted array of length m·n.</b> Because rows chain together in sorted order, a single binary search over the virtual flattened array works. Convert a flat index to 2D with <code>row = idx / cols</code>, <code>col = idx % cols</code>. This is cleaner than the two-step (find row, then find column) approach.",
        "code": "public boolean searchMatrix(int[][] matrix, int target) {\n    int m = matrix.length, n = matrix[0].length;\n    int lo = 0, hi = m * n - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        int val = matrix[mid / n][mid % n]; // flat → 2D\n        if (val == target) return true;\n        else if (val < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return false;\n}",
        "tc": "O(log(m·n))",
        "sc": "O(1)",
        "followup": ""
      },
      {
        "n": "04",
        "title": "Koko Eating Bananas",
        "diff": "med",
        "lc": "875",
        "pat": "Binary Search on Answer",
        "statement": "Koko eats bananas at <b>k</b> per hour from piles. Find the minimum <b>k</b> such that she finishes all piles within <b>h</b> hours.",
        "example": "piles=[3,6,7,11], h=8  →  4",
        "approach": "<b>Binary search the eating speed.</b> The answer k lies between 1 and max(piles). For a candidate speed, compute hours needed in O(n) — feasible if ≤ h. Faster speeds are always still feasible (monotonic), so binary search the minimum feasible speed. This is the archetypal \"search on answer\" problem: the array isn't what you search, the <em>answer range</em> is.",
        "code": "public int minEatingSpeed(int[] piles, int h) {\n    int lo = 1, hi = 0;\n    for (int p : piles) hi = Math.max(hi, p);\n    while (lo < hi) {\n        int k = lo + (hi - lo) / 2;\n        if (hoursNeeded(piles, k) <= h) hi = k; // feasible → try slower\n        else lo = k + 1;\n    }\n    return lo;\n}\nprivate long hoursNeeded(int[] piles, int k) {\n    long hours = 0;\n    for (int p : piles) hours += (p + k - 1) / k; // ceil(p/k)\n    return hours;\n}",
        "tc": "O(n log max)",
        "sc": "O(1)",
        "followup": "<span class='q'>How do you know the feasibility check is monotonic?</span> Be ready to state it: a higher speed never needs more hours, so 'feasible' is a step function — exactly what binary-search-on-answer requires. <span class='q'>Similar problems?</span> Ship capacity in D days (LC 1011), split array largest sum (LC 410) — same template."
      },
      {
        "n": "05",
        "title": "Median of Two Sorted Arrays",
        "diff": "hard",
        "lc": "4",
        "pat": "Binary Search Partition",
        "statement": "Given two sorted arrays, return the median of their combined elements in <b>O(log(m+n))</b>.",
        "example": "[1,3], [2]  →  2.0",
        "approach": "<b>Binary search the partition of the smaller array.</b> Find a split such that the left halves of both arrays together form the lower half of the merged array, with every left element ≤ every right element. Binary search the cut point in the shorter array; the cut in the other is determined. Check the boundary condition <code>maxLeft ≤ minRight</code> on both sides. Hard to derive live — worth pre-memorizing.",
        "code": "public double findMedianSortedArrays(int[] a, int[] b) {\n    if (a.length > b.length) return findMedianSortedArrays(b, a);\n    int m = a.length, n = b.length, half = (m + n + 1) / 2;\n    int lo = 0, hi = m;\n    while (lo <= hi) {\n        int i = lo + (hi - lo) / 2;   // cut in a\n        int j = half - i;               // cut in b\n        int aLeft  = (i == 0) ? Integer.MIN_VALUE : a[i-1];\n        int aRight = (i == m) ? Integer.MAX_VALUE : a[i];\n        int bLeft  = (j == 0) ? Integer.MIN_VALUE : b[j-1];\n        int bRight = (j == n) ? Integer.MAX_VALUE : b[j];\n        if (aLeft <= bRight && bLeft <= aRight) {   // correct partition\n            if (((m + n) & 1) == 1)\n                return Math.max(aLeft, bLeft);\n            return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2.0;\n        } else if (aLeft > bRight) hi = i - 1;\n        else lo = i + 1;\n    }\n    return 0.0;\n}",
        "tc": "O(log min(m,n))",
        "sc": "O(1)",
        "followup": "<span class='q'>Generalize to the kth element of two sorted arrays?</span> Same partition idea, or a recursive 'discard k/2' approach. <span class='q'>Median of many sorted arrays?</span> Binary-search the value range and count elements ≤ mid across all arrays. <span class='q'>Why search the shorter array?</span> Keeps the binary search range minimal and partition math valid."
      }
    ]
  },
  {
    "id": "bits",
    "name": "Bit Manipulation",
    "meta": "XOR tricks · Kernighan · masks",
    "intro": "Bit problems reward knowing a handful of <b>core tricks</b>: XOR cancels duplicates (<code>a^a=0</code>), <code>n &amp; (n-1)</code> clears the lowest set bit, <code>n &amp; (-n)</code> isolates it. Recognize these and most bit problems collapse to a one-liner. Reviewers love the elegant O(1)-space solutions these enable.",
    "problems": [
      {
        "n": "01",
        "title": "Single Number",
        "diff": "easy",
        "lc": "136",
        "pat": "XOR",
        "statement": "Every element appears twice except one. Find that single one with O(1) extra space.",
        "example": "[4,1,2,1,2]  →  4",
        "approach": "<b>XOR everything together.</b> XOR has two magic properties: <code>a^a=0</code> (duplicates cancel) and <code>a^0=a</code> (identity). XORing the whole array makes every pair vanish, leaving only the unique element. Order doesn't matter since XOR is commutative and associative. The cleanest possible solution.",
        "code": "public int singleNumber(int[] nums) {\n    int result = 0;\n    for (int n : nums) result ^= n; // pairs cancel out\n    return result;\n}",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": "<span class='q'>Every element appears 3× except one (LC 137)?</span> Count bits mod 3, or track two bitmask accumulators (ones/twos). <span class='q'>Two unique numbers, rest in pairs (LC 260)?</span> XOR everything, then split by a differing bit. These two extensions are classic escalations."
      },
      {
        "n": "02",
        "title": "Number of 1 Bits",
        "diff": "easy",
        "lc": "191",
        "pat": "Brian Kernighan",
        "statement": "Return the number of set bits (1s) in the binary representation of an integer.",
        "example": "n=11 (1011)  →  3",
        "approach": "<b>Brian Kernighan's trick: <code>n &amp; (n-1)</code> clears the lowest set bit.</b> Subtracting 1 flips the rightmost 1 to 0 and everything below it to 1; ANDing wipes those out. So each iteration removes exactly one set bit — the loop runs precisely as many times as there are 1s. Faster than checking all 32 bits when the number is sparse.",
        "code": "public int hammingWeight(int n) {\n    int count = 0;\n    while (n != 0) {\n        n &= n - 1;   // clear lowest set bit\n        count++;\n    }\n    return count;\n}",
        "tc": "O(set bits)",
        "sc": "O(1)",
        "followup": "<span class='q'>Why is Kernighan's faster than checking 32 bits?</span> It loops once per set bit, not per bit position — better on sparse numbers. <span class='q'>Count bits for all numbers 0..n?</span> See Counting Bits (DP). <span class='q'>Reverse the bits instead?</span> See Reverse Bits."
      },
      {
        "n": "03",
        "title": "Counting Bits",
        "diff": "easy",
        "lc": "338",
        "pat": "DP + Bits",
        "statement": "For every number from 0 to <b>n</b>, return an array where ans[i] is the number of 1 bits in i.",
        "example": "n=5  →  [0,1,1,2,1,2]",
        "approach": "<b>dp[i] = dp[i >> 1] + (i &amp; 1).</b> A number's bit count equals the count of \"itself shifted right by one\" (i.e. dropping the last bit) plus whether the dropped bit was 1. Since <code>i >> 1 &lt; i</code>, that value is already computed — classic DP building on prior answers. O(n) total versus O(n log n) of counting each independently.",
        "code": "public int[] countBits(int n) {\n    int[] dp = new int[n + 1];\n    for (int i = 1; i <= n; i++)\n        dp[i] = dp[i >> 1] + (i & 1); // half + last bit\n    return dp;\n}",
        "tc": "O(n)",
        "sc": "O(n)",
        "followup": ""
      },
      {
        "n": "04",
        "title": "Missing Number",
        "diff": "easy",
        "lc": "268",
        "pat": "XOR / Gauss",
        "statement": "Given an array of <b>n</b> distinct numbers from the range [0, n], find the one number that's missing.",
        "example": "[3,0,1]  →  2",
        "approach": "<b>XOR all indices with all values</b> — every matched pair cancels, leaving the missing index. Or use Gauss's formula: the expected sum is <code>n(n+1)/2</code>; subtract the actual sum to get the gap. Both are O(n) time, O(1) space. The XOR version avoids any overflow concern with large n.",
        "code": "// XOR approach\npublic int missingNumber(int[] nums) {\n    int result = nums.length;\n    for (int i = 0; i < nums.length; i++)\n        result ^= i ^ nums[i];   // index XOR value, pairs cancel\n    return result;\n}\n// Gauss approach: n*(n+1)/2 - sum(nums)",
        "tc": "O(n)",
        "sc": "O(1)",
        "followup": ""
      },
      {
        "n": "05",
        "title": "Sum of Two Integers",
        "diff": "med",
        "lc": "371",
        "pat": "XOR + Carry",
        "statement": "Compute the sum of two integers <b>a</b> and <b>b</b> without using the <code>+</code> or <code>-</code> operators.",
        "example": "a=2, b=3  →  5",
        "approach": "<b>Simulate binary addition with XOR and AND.</b> XOR gives the sum without carry (1+1=0). AND shifted left gives the carry (1+1 generates a carry to the next position). Repeat — add the carry to the partial sum — until there's no carry left. This literally rebuilds addition from logic gates.",
        "code": "public int getSum(int a, int b) {\n    while (b != 0) {\n        int carry = (a & b) << 1; // positions that carry\n        a = a ^ b;                 // sum without carry\n        b = carry;                 // add carry next round\n    }\n    return a;\n}",
        "tc": "O(1)",
        "sc": "O(1)",
        "followup": "<span class='q'>Handle negative numbers?</span> Two's-complement makes the same XOR/carry loop work — be ready to reason through it. <span class='q'>Subtraction without minus?</span> Add the two's complement (<code>~b + 1</code>). <span class='q'>Multiplication without *?</span> Shift-and-add using the same bit logic."
      },
      {
        "n": "06",
        "title": "Reverse Bits",
        "diff": "easy",
        "lc": "190",
        "pat": "Bit Shift",
        "statement": "Reverse the bits of a 32-bit unsigned integer (bit at position 0 moves to position 31, etc.).",
        "example": "00000010...100  →  001...01000000",
        "approach": "<b>Extract from the right of n, build into the left of result.</b> Each of the 32 iterations: shift result left to make room, OR in the lowest bit of n, then shift n right. Always do exactly 32 iterations — leading zeros matter for correct positioning. For repeated calls, an 8-bit lookup-table cache turns this into O(1) per call.",
        "code": "public int reverseBits(int n) {\n    int result = 0;\n    for (int i = 0; i < 32; i++) {\n        result = (result << 1) | (n & 1); // place LSB of n\n        n >>= 1;                          // consume it\n    }\n    return result;\n}",
        "tc": "O(1)",
        "sc": "O(1)",
        "followup": "<span class='q'>Called millions of times — optimize?</span> Cache results per byte in a lookup table and assemble four bytes — O(1) amortized. <span class='q'>Divide-and-conquer in O(log 32)?</span> Swap halves, then quarters, then bytes, nibbles, pairs with masks — no loop at all."
      }
    ]
  }
];

export const TEMPLATE_GROUPS: TemplateGroup[] = [
  {
    "id": "traversal",
    "name": "Graph / Grid Traversal",
    "meta": "BFS · DFS · the bread and butter",
    "intro": "These appear in <b>at least one of every couple of coding rounds</b>. Number of Islands, flood fill, shortest path, level-order — all reduce to BFS or DFS with small tweaks. Memorize the grid directions array and the visited-set pattern cold.",
    "templates": [
      {
        "id": "01",
        "title": "BFS on Grid",
        "when": "shortest path · level order · num islands",
        "note": "The <b>queue + visited</b> pattern. The <code>DIRS</code> array is your best friend — memorize <code>{{1,0},{-1,0},{0,1},{0,-1}}</code>. For shortest path, track levels by processing <code>queue.size()</code> nodes per round.",
        "code": "int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};\n\nint bfs(int[][] grid, int sr, int sc) {\n    int m = grid.length, n = grid[0].length;\n    boolean[][] seen = new boolean[m][n];\n    Queue<int[]> q = new LinkedList<>();\n\n    q.offer(new int[]{sr, sc});\n    seen[sr][sc] = true;\n    int steps = 0;\n\n    while (!q.isEmpty()) {\n        int size = q.size();          // nodes at current level\n        for (int i = 0; i < size; i++) {\n            int[] cur = q.poll();\n            int r = cur[0], c = cur[1];\n            // process (r, c) here\n\n            for (int[] d : DIRS) {\n                int nr = r + d[0], nc = c + d[1];\n                if (nr >= 0 && nr < m && nc >= 0 && nc < n\n                        && !seen[nr][nc] && grid[nr][nc] == 1) {\n                    seen[nr][nc] = true;\n                    q.offer(new int[]{nr, nc});\n                }\n            }\n        }\n        steps++;\n    }\n    return steps;\n}"
      },
      {
        "id": "02",
        "title": "DFS on Grid (recursive)",
        "when": "connected components · flood fill · area",
        "note": "The <b>mark-and-recurse</b> pattern. Mutating the grid in place (set to <code>0</code>) avoids a separate visited array. Always check bounds + validity at the <b>top</b> of the function — cleaner than checking before each call.",
        "code": "void dfs(int[][] grid, int r, int c) {\n    int m = grid.length, n = grid[0].length;\n\n    // base case: out of bounds or not part of region\n    if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] == 0)\n        return;\n\n    grid[r][c] = 0;                  // mark visited (sink the land)\n\n    dfs(grid, r + 1, c);\n    dfs(grid, r - 1, c);\n    dfs(grid, r, c + 1);\n    dfs(grid, r, c - 1);\n}\n\n// caller: count components\nint numIslands(int[][] grid) {\n    int count = 0;\n    for (int r = 0; r < grid.length; r++)\n        for (int c = 0; c < grid[0].length; c++)\n            if (grid[r][c] == 1) { count++; dfs(grid, r, c); }\n    return count;\n}"
      },
      {
        "id": "03",
        "title": "DFS on Graph (adjacency list)",
        "when": "cycle detect · path exists · topological",
        "note": "Build the <b>adjacency list</b> first, then recurse with a <code>visited</code> set. For directed cycle detection, use 3 states (0=unvisited, 1=in-progress, 2=done) instead of a boolean.",
        "code": "List<List<Integer>> buildGraph(int n, int[][] edges) {\n    List<List<Integer>> adj = new ArrayList<>();\n    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n    for (int[] e : edges) {\n        adj.get(e[0]).add(e[1]);\n        adj.get(e[1]).add(e[0]);   // omit for directed\n    }\n    return adj;\n}\n\nvoid dfs(int node, List<List<Integer>> adj, boolean[] seen) {\n    seen[node] = true;\n    // process node\n    for (int next : adj.get(node))\n        if (!seen[next]) dfs(next, adj, seen);\n}"
      },
      {
        "id": "04",
        "title": "Topological Sort (Kahn / BFS)",
        "when": "course schedule · build order · deps",
        "note": "Compute <b>in-degree</b> of every node, start BFS from all <code>0</code> in-degree nodes. If you can't process all <code>n</code> nodes, there's a cycle. This is the go-to for dependency-ordering problems.",
        "code": "int[] topoSort(int n, int[][] edges) {\n    List<List<Integer>> adj = new ArrayList<>();\n    int[] indeg = new int[n];\n    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n    for (int[] e : edges) {          // e = [course, prereq]\n        adj.get(e[1]).add(e[0]);\n        indeg[e[0]]++;\n    }\n\n    Queue<Integer> q = new LinkedList<>();\n    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);\n\n    int[] order = new int[n];\n    int idx = 0;\n    while (!q.isEmpty()) {\n        int cur = q.poll();\n        order[idx++] = cur;\n        for (int next : adj.get(cur))\n            if (--indeg[next] == 0) q.offer(next);\n    }\n    return idx == n ? order : new int[0];  // empty = cycle\n}"
      }
    ]
  },
  {
    "id": "binsearch",
    "name": "Binary Search",
    "meta": "the template that ends off-by-one bugs",
    "intro": "Most people get binary search wrong under pressure because of <b>boundary conditions</b>. Memorize ONE template and adapt it. The key decisions: <code>&lt;</code> vs <code>&lt;=</code>, and whether to do <code>mid+1</code> / <code>mid-1</code> / <code>mid</code>. The \"search on answer\" variant is a frequent senior-level twist.",
    "templates": [
      {
        "id": "05",
        "title": "Classic Binary Search",
        "when": "find target in sorted array",
        "note": "Use <code>lo &lt;= hi</code> with <code>lo = mid+1</code> / <code>hi = mid-1</code>. Compute mid as <code>lo + (hi-lo)/2</code> to <b>avoid integer overflow</b> — reviewers notice this detail.",
        "code": "int search(int[] nums, int target) {\n    int lo = 0, hi = nums.length - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;   // overflow-safe\n        if (nums[mid] == target) return mid;\n        else if (nums[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}"
      },
      {
        "id": "06",
        "title": "Leftmost / First Position (lower bound)",
        "when": "first occurrence · insert position · ceiling",
        "note": "Use <code>lo &lt; hi</code> with <code>hi = mid</code> (not mid-1). Converges to the <b>first index where condition holds</b>. This single template solves \"first/last position\", \"search insert\", and most \"find boundary\" problems.",
        "code": "// returns first index where nums[i] >= target\nint lowerBound(int[] nums, int target) {\n    int lo = 0, hi = nums.length;   // note: hi = length, not length-1\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (nums[mid] < target) lo = mid + 1;\n        else hi = mid;               // keep mid in search space\n    }\n    return lo;                       // insertion point\n}"
      },
      {
        "id": "07",
        "title": "Binary Search on Answer",
        "when": "minimize max · capacity to ship · koko bananas",
        "note": "When the answer is a <b>number in a range</b> and you can check \"is X feasible?\" in O(n). Binary search the answer space. Recognizing this pattern is a major senior-level differentiator — the array isn't sorted, the <i>answer</i> is.",
        "code": "// find min capacity such that feasible(capacity) is true\nint minCapacity(int[] weights, int days) {\n    int lo = 0, hi = 0;\n    for (int w : weights) { lo = Math.max(lo, w); hi += w; }\n\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (feasible(weights, days, mid)) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}\n\nboolean feasible(int[] w, int days, int cap) {\n    int needed = 1, cur = 0;\n    for (int x : w) {\n        if (cur + x > cap) { needed++; cur = 0; }\n        cur += x;\n    }\n    return needed <= days;\n}"
      }
    ]
  },
  {
    "id": "twopointer",
    "name": "Two Pointers & Sliding Window",
    "meta": "O(n) where brute force is O(n²)",
    "intro": "Two pointers turns nested loops into a single pass. <b>Sliding window</b> is the variable-size version — grow the right edge, shrink the left when a constraint breaks. Memorize the window skeleton; it solves a huge family of substring/subarray problems.",
    "templates": [
      {
        "id": "08",
        "title": "Sliding Window (variable size)",
        "when": "longest substring · min window · max sum",
        "note": "Expand <code>right</code> always, shrink <code>left</code> while the window is invalid. Update the answer at the right point (inside or after the shrink, depending on min vs max). The <code>while</code> shrink loop is the heart of it.",
        "code": "int longestValidWindow(String s) {\n    int[] count = new int[128];   // or a HashMap\n    int left = 0, best = 0;\n\n    for (int right = 0; right < s.length(); right++) {\n        char c = s.charAt(right);\n        count[c]++;                  // include c in window\n\n        while (/* window invalid */ count[c] > 1) {\n            count[s.charAt(left)]--;  // shrink from left\n            left++;\n        }\n        best = Math.max(best, right - left + 1);\n    }\n    return best;\n}"
      },
      {
        "id": "09",
        "title": "Two Pointers (opposite ends)",
        "when": "two sum sorted · container water · palindrome",
        "note": "Start pointers at both ends, move them <b>toward each other</b> based on a comparison. The sorted-array precondition is what makes the greedy move correct.",
        "code": "int[] twoSumSorted(int[] nums, int target) {\n    int lo = 0, hi = nums.length - 1;\n    while (lo < hi) {\n        int sum = nums[lo] + nums[hi];\n        if (sum == target) return new int[]{lo, hi};\n        else if (sum < target) lo++;      // need bigger\n        else hi--;                         // need smaller\n    }\n    return new int[]{-1, -1};\n}"
      },
      {
        "id": "10",
        "title": "Fast & Slow Pointers",
        "when": "cycle detect · middle of list · find duplicate",
        "note": "Floyd's algorithm. <code>slow</code> moves 1 step, <code>fast</code> moves 2. If they meet, there's a cycle. To find cycle start: reset one pointer to head, move both 1 step until they meet again.",
        "code": "boolean hasCycle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;            // 1 step\n        fast = fast.next.next;       // 2 steps\n        if (slow == fast) return true;  // they met\n    }\n    return false;\n}"
      }
    ]
  },
  {
    "id": "heap",
    "name": "Heap / Priority Queue",
    "meta": "top-K, merge-K, running median",
    "intro": "Whenever you see <b>\"K-th largest\", \"top K\", \"merge K\", or \"closest K\"</b> — reach for a heap. In Java, <code>PriorityQueue</code> is a min-heap by default. Memorize the comparator syntax for max-heap and custom objects.",
    "templates": [
      {
        "id": "11",
        "title": "Top K Elements",
        "when": "kth largest · k closest · k frequent",
        "note": "Keep a <b>min-heap of size K</b>. When it exceeds K, poll the smallest. What remains is the top K. For \"kth largest\", the heap top is your answer. Min-heap of size K = O(n log k), better than sorting.",
        "code": "int findKthLargest(int[] nums, int k) {\n    PriorityQueue<Integer> minHeap = new PriorityQueue<>();\n    for (int num : nums) {\n        minHeap.offer(num);\n        if (minHeap.size() > k) minHeap.poll();  // drop smallest\n    }\n    return minHeap.peek();   // kth largest at top\n}\n\n// Max-heap syntax: Collections.reverseOrder()\n// PriorityQueue<Integer> maxHeap =\n//     new PriorityQueue<>(Collections.reverseOrder());\n\n// Custom comparator (by frequency):\n// new PriorityQueue<>((a,b) -> freq[a] - freq[b]);"
      },
      {
        "id": "12",
        "title": "Merge K Sorted Lists",
        "when": "merge k lists · smallest range · k-way merge",
        "note": "Push the head of each list into a min-heap. Poll the smallest, add it to the result, then push its <code>next</code>. Classic k-way merge in O(N log k).",
        "code": "ListNode mergeKLists(ListNode[] lists) {\n    PriorityQueue<ListNode> pq =\n        new PriorityQueue<>((a, b) -> a.val - b.val);\n\n    for (ListNode node : lists)\n        if (node != null) pq.offer(node);\n\n    ListNode dummy = new ListNode(0), tail = dummy;\n    while (!pq.isEmpty()) {\n        ListNode cur = pq.poll();\n        tail.next = cur;\n        tail = cur;\n        if (cur.next != null) pq.offer(cur.next);\n    }\n    return dummy.next;\n}"
      },
      {
        "id": "13",
        "title": "Two Heaps (running median)",
        "when": "find median from stream · sliding median",
        "note": "A <b>max-heap for the lower half</b>, a <b>min-heap for the upper half</b>. Keep sizes balanced. Median is either the top of the larger heap, or the average of both tops. Elegant once you see it.",
        "code": "class MedianFinder {\n    PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder()); // max-heap\n    PriorityQueue<Integer> hi = new PriorityQueue<>();                          // min-heap\n\n    void addNum(int num) {\n        lo.offer(num);\n        hi.offer(lo.poll());            // balance values\n        if (hi.size() > lo.size())   // balance sizes\n            lo.offer(hi.poll());\n    }\n\n    double findMedian() {\n        if (lo.size() > hi.size()) return lo.peek();\n        return (lo.peek() + hi.peek()) / 2.0;\n    }\n}"
      }
    ]
  },
  {
    "id": "dp",
    "name": "Dynamic Programming",
    "meta": "1D · 2D · the recurrence skeletons",
    "intro": "DP is <b>recognizing the recurrence</b>, then choosing top-down (memo) or bottom-up (table). Memorize both skeletons. The hard part is defining the state — these templates give you the scaffolding so you only think about the transition.",
    "templates": [
      {
        "id": "14",
        "title": "Top-Down DP (memoization)",
        "when": "any DP · when recursion is natural",
        "note": "Write the recursion first, then add a <code>memo</code> array/map. The pattern: check memo → base case → compute → store → return. Easiest to derive under pressure since it mirrors the brute-force recursion.",
        "code": "Integer[] memo;\n\nint solve(int[] nums, int i) {\n    if (i >= nums.length) return 0;        // base case\n    if (memo[i] != null) return memo[i];   // already computed\n\n    int take  = nums[i] + solve(nums, i + 2);\n    int skip  = solve(nums, i + 1);\n\n    return memo[i] = Math.max(take, skip);   // store + return\n}\n\n// init: memo = new Integer[nums.length];"
      },
      {
        "id": "15",
        "title": "Bottom-Up DP (1D table)",
        "when": "house robber · climb stairs · coin change",
        "note": "Define <code>dp[i]</code>, fill from base cases upward. Often you can <b>optimize space to O(1)</b> by keeping only the last 1-2 values. Mention that optimization to reviewers even if you code the array version.",
        "code": "int rob(int[] nums) {\n    int n = nums.length;\n    if (n == 0) return 0;\n    int[] dp = new int[n + 1];\n    dp[0] = 0;\n    dp[1] = nums[0];\n\n    for (int i = 2; i <= n; i++)\n        dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1]);\n\n    return dp[n];\n}\n\n// O(1) space: track prev2, prev1 instead of full array"
      },
      {
        "id": "16",
        "title": "Bottom-Up DP (2D table)",
        "when": "edit distance · LCS · unique paths · knapsack",
        "note": "For two-sequence problems. <code>dp[i][j]</code> = answer for first <code>i</code> of A and first <code>j</code> of B. Fill row by row. The <b>match vs no-match branch</b> is the universal LCS/edit-distance pattern.",
        "code": "int longestCommonSubseq(String a, String b) {\n    int m = a.length(), n = b.length();\n    int[][] dp = new int[m + 1][n + 1];\n\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (a.charAt(i-1) == b.charAt(j-1))\n                dp[i][j] = dp[i-1][j-1] + 1;       // match\n            else\n                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n        }\n    }\n    return dp[m][n];\n}"
      }
    ]
  },
  {
    "id": "backtrack",
    "name": "Backtracking",
    "meta": "subsets · permutations · combinations",
    "intro": "One skeleton powers <b>all</b> backtracking: choose → explore → un-choose. Subsets, permutations, combinations, N-Queens, word search — same shape. Memorize the template and the three variations (start index, used array, in-place swap).",
    "templates": [
      {
        "id": "17",
        "title": "Subsets / Combinations",
        "when": "subsets · combination sum · partition",
        "note": "Use a <code>start</code> index to avoid duplicates and enforce order. Add the current path at <b>every node</b> (subsets) or only at leaves (combinations of fixed size). The <code>start</code> index prevents reusing earlier elements.",
        "code": "List<List<Integer>> subsets(int[] nums) {\n    List<List<Integer>> res = new ArrayList<>();\n    backtrack(nums, 0, new ArrayList<>(), res);\n    return res;\n}\n\nvoid backtrack(int[] nums, int start,\n               List<Integer> path,\n               List<List<Integer>> res) {\n    res.add(new ArrayList<>(path));   // every node is a subset\n\n    for (int i = start; i < nums.length; i++) {\n        path.add(nums[i]);              // choose\n        backtrack(nums, i + 1, path, res); // explore\n        path.remove(path.size() - 1);   // un-choose\n    }\n}"
      },
      {
        "id": "18",
        "title": "Permutations",
        "when": "permutations · anagrams · arrangements",
        "note": "No <code>start</code> index — instead a <code>used[]</code> array tracks which elements are in the current path. Add to results only at the leaf (when path is full length). The un-choose step resets <code>used</code>.",
        "code": "List<List<Integer>> permute(int[] nums) {\n    List<List<Integer>> res = new ArrayList<>();\n    backtrack(nums, new ArrayList<>(),\n              new boolean[nums.length], res);\n    return res;\n}\n\nvoid backtrack(int[] nums, List<Integer> path,\n               boolean[] used, List<List<Integer>> res) {\n    if (path.size() == nums.length) {\n        res.add(new ArrayList<>(path));\n        return;\n    }\n    for (int i = 0; i < nums.length; i++) {\n        if (used[i]) continue;\n        used[i] = true; path.add(nums[i]);\n        backtrack(nums, path, used, res);\n        used[i] = false; path.remove(path.size() - 1);\n    }\n}"
      }
    ]
  },
  {
    "id": "structures",
    "name": "Core Structures",
    "meta": "Union-Find · Trie · the ones to know cold",
    "intro": "Two structures appear so often they're worth memorizing as <b>complete units</b>: Union-Find (connectivity, cycles, Kruskal) and Trie (prefix problems). Writing these flawlessly under pressure signals strong fundamentals.",
    "templates": [
      {
        "id": "19",
        "title": "Union-Find (DSU)",
        "when": "connected components · cycle · Kruskal MST",
        "note": "Path compression in <code>find</code> + union by rank. Nearly O(1) per op. The <code>find</code> one-liner with recursion is the cleanest. Track <code>count</code> to answer \"number of components\" for free.",
        "code": "class DSU {\n    int[] parent, rank;\n    int count;\n\n    DSU(int n) {\n        parent = new int[n];\n        rank = new int[n];\n        count = n;\n        for (int i = 0; i < n; i++) parent[i] = i;\n    }\n\n    int find(int x) {\n        if (parent[x] != x) parent[x] = find(parent[x]); // compress\n        return parent[x];\n    }\n\n    boolean union(int a, int b) {\n        int ra = find(a), rb = find(b);\n        if (ra == rb) return false;        // already joined\n        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }\n        parent[rb] = ra;\n        if (rank[ra] == rank[rb]) rank[ra]++;\n        count--;\n        return true;\n    }\n}"
      },
      {
        "id": "20",
        "title": "Trie (Prefix Tree)",
        "when": "autocomplete · word search · prefix match",
        "note": "Array-of-26 children is faster than a HashMap for lowercase-only. <code>isEnd</code> marks complete words. Insert/search/startsWith all walk the tree in O(word length).",
        "code": "class Trie {\n    Trie[] children = new Trie[26];\n    boolean isEnd = false;\n\n    void insert(String word) {\n        Trie node = this;\n        for (char c : word.toCharArray()) {\n            int i = c - 'a';\n            if (node.children[i] == null)\n                node.children[i] = new Trie();\n            node = node.children[i];\n        }\n        node.isEnd = true;\n    }\n\n    boolean search(String word) {\n        Trie node = walk(word);\n        return node != null && node.isEnd;\n    }\n\n    boolean startsWith(String p) { return walk(p) != null; }\n\n    Trie walk(String s) {\n        Trie node = this;\n        for (char c : s.toCharArray()) {\n            node = node.children[c - 'a'];\n            if (node == null) return null;\n        }\n        return node;\n    }\n}"
      },
      {
        "id": "21",
        "title": "Monotonic Stack",
        "when": "next greater · daily temps · histogram",
        "note": "Keep the stack <b>monotonic</b> (increasing or decreasing). When the new element breaks the order, pop — each pop resolves an answer. Each element pushed/popped once → O(n).",
        "code": "int[] nextGreater(int[] nums) {\n    int n = nums.length;\n    int[] res = new int[n];\n    Arrays.fill(res, -1);\n    Deque<Integer> stack = new ArrayDeque<>();  // holds indices\n\n    for (int i = 0; i < n; i++) {\n        while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {\n            res[stack.pop()] = nums[i];  // i is next greater\n        }\n        stack.push(i);\n    }\n    return res;\n}"
      }
    ]
  },
  {
    "id": "utils",
    "name": "Java Utilities",
    "meta": "syntax you must not fumble",
    "intro": "The Java-specific syntax that <b>wastes time if you blank on it</b>. Sorting with comparators, the HashMap idioms, char/int conversions. None of this is algorithmic — but fumbling it on the whiteboard kills momentum. Drill until automatic.",
    "templates": [
      {
        "id": "22",
        "title": "Sorting & Comparators",
        "when": "sort by custom key · 2D array · intervals",
        "note": "Lambda comparators are the most-used and most-forgotten syntax. For intervals, sort by start. <b>Avoid <code>a[0]-b[0]</code> for large ints</b> (overflow) — use <code>Integer.compare</code>.",
        "code": "// sort int[][] by first element (intervals)\nArrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n\n// sort List by custom key, descending\nlist.sort((a, b) -> b.value - a.value);\n\n// sort strings by length then lexicographically\nArrays.sort(words, (a, b) ->\n    a.length() != b.length()\n        ? a.length() - b.length()\n        : a.compareTo(b));\n\n// sort and keep indices: sort an Integer[] of indices\nInteger[] idx = new Integer[n];\nfor (int i = 0; i < n; i++) idx[i] = i;\nArrays.sort(idx, (a, b) -> nums[a] - nums[b]);"
      },
      {
        "id": "23",
        "title": "HashMap Idioms",
        "when": "frequency count · grouping · seen-before",
        "note": "<code>getOrDefault</code> and <code>merge</code> are the two idioms that save the most time. <code>computeIfAbsent</code> for map-of-lists (grouping/adjacency). Memorize all three.",
        "code": "Map<Character, Integer> freq = new HashMap<>();\n\n// count frequency — two equivalent idioms\nfreq.put(c, freq.getOrDefault(c, 0) + 1);\nfreq.merge(c, 1, Integer::sum);          // cleaner\n\n// map of lists (grouping / adjacency)\nMap<String, List<String>> groups = new HashMap<>();\ngroups.computeIfAbsent(key, k -> new ArrayList<>())\n      .add(value);\n\n// iterate entries\nfor (Map.Entry<Character, Integer> e : freq.entrySet()) {\n    char k = e.getKey();\n    int v = e.getValue();\n}"
      },
      {
        "id": "24",
        "title": "Char / Int / String Conversions",
        "when": "string parsing · digit math · char arithmetic",
        "note": "The conversions everyone half-remembers. <code>c - '0'</code> for digit, <code>c - 'a'</code> for alphabet index. <code>StringBuilder</code> for any string building — never <code>+=</code> in a loop (O(n²)).",
        "code": "// char digit → int\nint d = c - '0';                 // '7' → 7\n\n// char letter → index 0-25\nint idx = c - 'a';               // 'c' → 2\n\n// int → char\nchar ch = (char)('a' + idx);\n\n// string ↔ char array\nchar[] arr = s.toCharArray();\nString back = new String(arr);\n\n// build strings efficiently — NEVER += in a loop\nStringBuilder sb = new StringBuilder();\nsb.append(c);\nsb.reverse();\nString result = sb.toString();\n\n// parse & format\nint num = Integer.parseInt(\"42\");\nString str = String.valueOf(num);"
      }
    ]
  }
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export const TOTAL_PROBLEMS = CATEGORIES.reduce((s, c) => s + c.problems.length, 0);
export const TOTAL_TEMPLATES = TEMPLATE_GROUPS.reduce((s, g) => s + g.templates.length, 0);
