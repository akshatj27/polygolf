# GolfScript

```polygolf
println (3+1);
```

```golfscript bytes
4 puts
```

```polygolf
print 1;
print 2;
```

```golfscript bytes
1 print 2 puts
```

```polygolf
for $i 0 31 {
  println ((1 + $i) + ($i * $i));
};
```

```golfscript bytes
31,{:i;1 i+i i*+puts}%
```

```polygolf
println (argv_get 5);
```

```golfscript bytes
:a;5 a=puts
```
