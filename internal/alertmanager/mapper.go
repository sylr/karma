package alertmanager

import (
	"github.com/prymitive/karma/internal/mapper"
	"github.com/prymitive/karma/internal/mapper/v04"
	"github.com/prymitive/karma/internal/mapper/v05"
	"github.com/prymitive/karma/internal/mapper/v061"
	"github.com/prymitive/karma/internal/mapper/v062"
)

// initialize all mappers
func init() {
	mapper.RegisterAlertMapper(v04.AlertMapper{})
	mapper.RegisterAlertMapper(v05.AlertMapper{})
	mapper.RegisterAlertMapper(v061.AlertMapper{})
	mapper.RegisterAlertMapper(v062.AlertMapper{})
	mapper.RegisterSilenceMapper(v04.SilenceMapper{})
	mapper.RegisterSilenceMapper(v05.SilenceMapper{})
}
