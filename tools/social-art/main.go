// Optional, offline artwork tool; never called by the production site build.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"image/color"
	"math/rand"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jdxyw/generativeart"
	"github.com/jdxyw/generativeart/arts"
)

func main() {
	out := flag.String("out", "../../assets/social-art", "output directory")
	manifest := flag.String("manifest", "../../lib/social-articles.json", "curated article artwork manifest")
	flag.Parse()
	// Upstream uses the process-global math/rand throughout its engines and
	// Perlin noise. Go 1.24+ disables Seed by default. Require this explicit,
	// process-scoped compatibility switch; never change global Go settings.
	if !strings.Contains(os.Getenv("GODEBUG"), "randseednop=0") {
		panic("run this standalone tool with GODEBUG=randseednop=0")
	}
	rand.Seed(1)
	probe := rand.Uint64()
	rand.Seed(1)
	if probe != rand.Uint64() {
		panic("math/rand.Seed is disabled; cannot guarantee repeatability")
	}
	if err := os.MkdirAll(*out, 0755); err != nil {
		panic(err)
	}
	palette := []color.RGBA{{11, 111, 104, 255}, {70, 143, 133, 255}, {162, 194, 179, 255}, {205, 177, 129, 255}}
	var articles map[string]struct {
		Engine string
		Seed   int64
	}
	data, err := os.ReadFile(*manifest)
	if err != nil {
		panic(err)
	}
	if err := json.Unmarshal(data, &articles); err != nil {
		panic(err)
	}
	slugs := make([]string, 0, len(articles))
	for slug := range articles {
		slugs = append(slugs, slug)
	}
	sort.Strings(slugs)

	// Sequential by design: every engine receives a fresh seed and palette.
	for _, slug := range slugs {
		sample := articles[slug]
		rand.Seed(sample.Seed)
		var engine generativeart.Engine
		switch sample.Engine {
		case "grid":
			engine = arts.NewGirdSquares(80, 60, 0.15)
		case "maze":
			engine = arts.NewMaze(40)
		case "contours":
			engine = arts.NewContourLine(110)
		case "orbits":
			engine = arts.NewCircleGrid(4, 6)
		case "waves":
			engine = arts.NewDotsWave(20)
		default:
			panic("unknown engine for " + slug)
		}
		c := generativeart.NewCanva(800, 800)
		c.SetBackground(color.RGBA{242, 240, 231, 255})
		c.FillBackground()
		c.SetColorSchema(append([]color.RGBA(nil), palette...))
		c.SetLineColor(color.RGBA{11, 111, 104, 255})
		c.SetLineWidth(4)
		c.SetIterations(3)
		c.SetAlpha(175)
		c.Draw(engine)
		filename := filepath.Join(*out, slug+".png")
		if err := c.ToPNG(filename); err != nil {
			panic(err)
		}
		fmt.Println(filename)
	}
}
