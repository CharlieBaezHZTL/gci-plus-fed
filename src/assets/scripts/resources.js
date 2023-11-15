var ResourcesController;
var ResourcesViewModel = function () {
    var self = this;

    self.ServerSide = ko.observable(false);
    self.Resources = ko.observableArray([]);
    self.ContextItem = ko.observable("");
    self.SelectedType = ko.observable("");
    self.SelectedTopic = ko.observable("");
    self.SelectedIndustry = ko.observable("");
    self.SelectedTags = ko.observable("");
    self.Page = ko.observable(0);
    self.PageSize = 6;
    self.OriginalPageSize = 6;
    self.TotalPages = ko.observable(0);
    self.MoreResults = ko.observable(true);
    self.Loading = ko.observable(false);
    self.FiltersEnabled = false;

    self.ChangeFilter = function () {
        if (!$('.btn-apply-resource-filters').is(":visible"))
            self.DisableFilters();

        var selectedTags = "";
        $('#ResourceFilters .filter-group .form-check-input').each(function () {
            var input = $(this);
            if (input.is(":checked")) {
                selectedTags += input.val() + "|";
            }
        });
        self.SelectedTags(selectedTags);
        
        if (!$('.btn-apply-resource-filters').is(":visible"))
            self.ApplyFilters();
    };

    self.ApplyFilters = function () {
        if ($('.d-block.d-lg-none').attr('aria-expanded') === 'true')
            $('.d-block.d-lg-none').click();
        
        self.ServerSide(false);
        self.Page(0);
        self.Resources([]);
        self.MoreResults(true);
        self.LoadMore();
        self.PageSize = self.OriginalPageSize;
    };

    self.ClearFilters = function () {
        self.DisableFilters();
        self.SelectedTags("");
        $('#ResourceFilters .filter-group .form-check-input').each(function () {
            var input = $(this);
            if (input.is(":checked")) {
                input.prop('checked', false);
            }
        });
        self.ApplyFilters();
    };

    self.LoadMore = function () {
        self.Loading(true);
        var promise = self.GetNewData().done(function (data) {
            Enumerable.From(data.Resources).ForEach(function (a) {
                self.Resources.push(a);
            });

            if (data.TotalNumberOfResults < ((self.Page() + 1) * self.PageSize))
                self.MoreResults(false);

            self.Page(self.Page() + 1);
            self.Loading(false);
            
            if (!self.FiltersEnabled)
                self.EnableFilters();
        });
    };

    self.GetNewData = function () {
        var ajax = $.ajax({
            type: 'POST',
            contentType: 'application/json;charset=utf-8',
            url: '/api/gciresources/getresources?skip=' + self.Page() + '&take=' + self.PageSize + '&tags=' + self.SelectedTags() + '&contextitem=' + self.ContextItem(),
            success: function (data) {
            },
            error: function (x, y, z) {

            }
        });

        return ajax;
    };
    
    self.DisableFilters = function () {
        self.FiltersEnabled = false;
        $('#ResourceFilters .filter-group .form-check-input').attr('disabled', 'true');
    };

    self.EnableFilters = function () {
        self.FiltersEnabled = true;
        $('#ResourceFilters .filter-group .form-check-input').removeAttr('disabled');
    };
    
    self.IsFacetSelected = function () {
        return $('#ResourceFilters .filter-group .form-check-input').is(":checked");
    };
};

function InitializeResources() {
    ResourcesController = new ResourcesViewModel();

    if ($('#GCIResources').length) {
        ResourcesController.ContextItem($("#GCIResources").data("contextitem"));
        ko.applyBindings(ResourcesController, document.getElementById('GCIResources'));
    
        if (ResourcesController.IsFacetSelected()) {
            ResourcesController.ChangeFilter();
        }
        else {
            ResourcesController.DisableFilters();
            ResourcesController.LoadMore();
        }
    }
}

$(window).ready(function () {
    InitializeResources();
})